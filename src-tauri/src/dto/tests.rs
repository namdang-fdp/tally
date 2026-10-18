use super::*;
use serde_json::{Value, json};

fn round_trip<T>(value: Value)
where
    T: serde::de::DeserializeOwned + serde::Serialize,
{
    let decoded: T = serde_json::from_value(value.clone()).expect("decode wire DTO");
    assert_eq!(serde_json::to_value(decoded).unwrap(), value);
}

#[test]
fn task_wire_preserves_null_dates_and_unicode_without_normalizing() {
    for title in ["Đọc sách 📚", "a\u{301}", "á", "<b>việc</b>"] {
        round_trip::<TaskDto>(json!({
            "id": "11111111-1111-4111-8111-111111111111",
            "title": title, "plannedDay": null, "completed": false,
            "createdAt": "2026-10-18T03:00:00.000Z",
            "updatedAt": "2026-10-18T03:00:00.000Z"
        }));
    }
}

#[test]
fn request_targets_preserve_intent_and_reject_unknown_or_missing_fields() {
    for target in [
        json!({"kind":"today"}),
        json!({"kind":"day","day":"2026-10-18"}),
        json!({"kind":"later"}),
    ] {
        round_trip::<CreateTaskRequest>(json!({
            "id":"11111111-1111-4111-8111-111111111111", "title":"Đọc 📚",
            "target":target,"completed":true,"expectedRevision":"7"
        }));
    }
    assert!(serde_json::from_value::<TaskTarget>(json!({"kind":"day"})).is_err());
    assert!(
        serde_json::from_value::<TaskTarget>(json!({"kind":"today","day":"2026-10-18"})).is_err()
    );
    assert!(serde_json::from_value::<TaskTarget>(json!({"kind":"tomorrow"})).is_err());
    assert!(serde_json::from_value::<TaskTarget>(json!({"kind":"day","day":null})).is_err());
    assert!(serde_json::from_value::<EmptyRequest>(json!({"sql":"select 1"})).is_err());
}

#[test]
fn nullable_request_fields_are_required_and_restore_requires_true() {
    round_trip::<PageRequest>(json!({"offset":0,"limit":100,"revision":null}));
    assert!(serde_json::from_value::<PageRequest>(json!({"offset":0,"limit":100})).is_err());
    assert!(
        serde_json::from_value::<PageRequest>(json!({"offset":-1,"limit":100,"revision":null}))
            .is_err()
    );
    assert!(serde_json::from_value::<RestoreDataRequest>(json!({
        "previewToken":"33333333-3333-4333-8333-333333333333", "expectedRevision":"7", "confirmed":false
    })).is_err());
}

#[test]
fn typed_errors_distinguish_unknown_from_not_applied_and_preserve_recovery() {
    for outcome in ["notApplied", "unknown", "notApplicable"] {
        round_trip::<IpcError>(json!({
            "code":"IPC_UNAVAILABLE", "message":"Chưa xác định kết quả.",
            "field":null,"retryable":false,"outcome":outcome,"recoveryBackup":null
        }));
    }
    assert!(serde_json::from_value::<ErrorOutcome>(json!("failed")).is_err());
    assert!(serde_json::from_value::<ErrorCode>(json!("SQLITE_PRIVATE_ERROR")).is_err());
    for code in ["DESKTOP_ERROR", "DESKTOP_UNSUPPORTED"] {
        round_trip::<ErrorCode>(json!(code));
    }
}

#[test]
fn export_and_preview_only_accept_format_version_one() {
    for version in [0, 1, 2] {
        let export = json!({"status":"exported", "path":"/tmp/tally-fixture.json", "revision":"8", "formatVersion":version});
        let preview = json!({
            "status":"ready", "previewToken":"33333333-3333-4333-8333-333333333333",
            "fileName":"fixture.json", "formatVersion":version, "taskCount":1,
            "completionCount":1, "reportingTimezone":"Asia/Ho_Chi_Minh",
            "theme":"system", "expiresAt":"2026-10-18T03:10:00.000Z", "replacesAllData":true
        });
        if version == 1 {
            round_trip::<ExportDataDto>(export);
            round_trip::<RestorePreviewDto>(preview);
        } else {
            assert!(serde_json::from_value::<ExportDataDto>(export).is_err());
            assert!(serde_json::from_value::<RestorePreviewDto>(preview).is_err());
        }
    }
}

fn shared_fixtures() -> Value {
    serde_json::from_str(include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../src/lib/api/contract-fixtures.json"
    )))
    .expect("shared fixture JSON")
}

fn check_case<Request, Response>(case: &Value)
where
    Request: serde::de::DeserializeOwned + serde::Serialize,
    Response: serde::de::DeserializeOwned + serde::Serialize,
{
    assert_eq!(case["args"].as_object().unwrap().len(), 1);
    let request = case["args"]["request"].clone();
    round_trip::<Request>(request.clone());
    round_trip::<Response>(case["response"].clone());
    let mut extra_field = request;
    extra_field["unexpected"] = json!(true);
    assert!(serde_json::from_value::<Request>(extra_field).is_err());
}

#[test]
fn shared_json_requests_and_responses_round_trip_through_every_command_shape() {
    let fixtures = shared_fixtures();
    let mut seen = std::collections::BTreeSet::new();
    for case in fixtures["cases"].as_array().unwrap() {
        let command = case["command"].as_str().unwrap();
        seen.insert(command);
        match command {
            "get_context" => check_case::<EmptyRequest, ContextDto>(case),
            "list_tasks" => check_case::<ListTasksRequest, ListTasksDto>(case),
            "create_task" => check_case::<CreateTaskRequest, TaskMutationDto>(case),
            "edit_task" => check_case::<EditTaskRequest, TaskMutationDto>(case),
            "move_task" => check_case::<MoveTaskRequest, TaskMutationDto>(case),
            "complete_task" | "reopen_task" | "delete_task" => {
                check_case::<TaskIdRequest, TaskMutationDto>(case);
            }
            "undo_last" => check_case::<UndoLastRequest, TaskMutationDto>(case),
            "get_stats" => check_case::<GetStatsRequest, StatsDto>(case),
            "list_history" => check_case::<ListHistoryRequest, ListHistoryDto>(case),
            "get_settings" => check_case::<EmptyRequest, GetSettingsDto>(case),
            "set_theme" => check_case::<SetThemeRequest, SetThemeDto>(case),
            "export_data" => check_case::<EmptyRequest, ExportDataDto>(case),
            "preview_restore" => check_case::<EmptyRequest, RestorePreviewDto>(case),
            "restore_data" => check_case::<RestoreDataRequest, RestoreDataDto>(case),
            "get_restore_recovery" => check_case::<EmptyRequest, RestoreRecoveryDto>(case),
            other => panic!("fixture command has no wire assertion: {other}"),
        }
    }
    assert_eq!(seen.len(), 17);
    for error in fixtures["errors"].as_array().unwrap() {
        round_trip::<IpcError>(error.clone());
    }
}

fn reject_missing<T: serde::de::DeserializeOwned>(value: &Value, fields: &[&str]) {
    for field in fields {
        let mut missing = value.clone();
        assert!(missing.as_object_mut().unwrap().remove(*field).is_some());
        assert!(
            serde_json::from_value::<T>(missing).is_err(),
            "missing {field} accepted"
        );
    }
}

#[test]
fn shared_nullable_fields_are_present_not_optional() {
    let fixtures = shared_fixtures();
    reject_missing::<TaskDto>(&fixtures["samples"]["task"], &["plannedDay"]);
    reject_missing::<HistoryItemDto>(&fixtures["samples"]["history"], &["plannedDaySnapshot"]);
    reject_missing::<IpcError>(&fixtures["errors"][0], &["field", "recoveryBackup"]);
    for case in fixtures["cases"].as_array().unwrap() {
        match case["command"].as_str().unwrap() {
            "get_context" => reject_missing::<ContextDto>(&case["response"], &["undo"]),
            "list_tasks" => {
                reject_missing::<PageDto<TaskDto>>(&case["response"]["page"], &["nextOffset"])
            }
            "get_restore_recovery" => {
                reject_missing::<RestoreRecoveryDto>(&case["response"], &["latestBackup"])
            }
            "get_stats" => {
                reject_missing::<GetStatsRequest>(&case["args"]["request"], &["revision"])
            }
            _ => {}
        }
    }
}

#[test]
fn shared_unicode_boundaries_and_large_revision_keep_exact_wire_strings() {
    let fixtures = shared_fixtures();
    let titles = &fixtures["samples"]["titles"];
    assert_ne!(titles["nfc"], titles["nfd"]);
    for (name, count) in [("emoji500", 500), ("emoji501", 501)] {
        let title = titles[name].as_str().unwrap();
        assert_eq!(title.chars().count(), count);
        assert_eq!(title.encode_utf16().count(), count * 2);
        let mut task = fixtures["samples"]["task"].clone();
        task["title"] = json!(title);
        // A wire codec preserves 501 too; only a future domain boundary rejects it.
        round_trip::<TaskDto>(task);
    }
    let mut context = fixtures["cases"][0]["response"].clone();
    context["revision"] = json!("9007199254740993");
    context["today"] = json!("2024-02-29");
    round_trip::<ContextDto>(context.clone());
    context["revision"] = json!(9007199254740993_u64);
    assert!(serde_json::from_value::<ContextDto>(context).is_err());
    assert!(serde_json::from_str::<TaskTarget>(r#"{"kind":"day","day":"\uD800"}"#).is_err());
}
