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
