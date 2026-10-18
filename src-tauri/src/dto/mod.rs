//! Approved TAL-4 wire shapes, not domain validation or runtime providers.
//!
//! IDs/dates/timezones/revisions remain strings on the wire. Provider boundaries
//! must validate their semantic values before constructing trusted domain types.
use serde::{Deserialize, Deserializer, Serialize};

pub type Id = String;
pub type Day = String;
pub type UtcInstant = String;
pub type Timezone = String;
pub type Revision = String;

// An explicit null is valid; omitting the field is not. Serde's default Option
// behavior would otherwise silently accept missing nullable request fields.
fn required_nullable<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    Option::<T>::deserialize(deserializer)
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "kind", deny_unknown_fields)]
pub enum TaskTarget {
    Today {},
    Day { day: Day },
    Later {},
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "kind", deny_unknown_fields)]
pub enum TaskView {
    Day { day: Day },
    Later {},
    Pending {},
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UndoAction {
    Create,
    Edit,
    Move,
    Complete,
    Reopen,
    Delete,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Theme {
    System,
    Light,
    Dark,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ErrorOutcome {
    NotApplied,
    Unknown,
    NotApplicable,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    ValidationError,
    NotFound,
    TaskDeleted,
    IdConflict,
    RevisionConflict,
    UndoUnavailable,
    PreviewExpired,
    ImportTooLarge,
    UnsupportedFormat,
    InvalidBackup,
    BackupFailed,
    FileIoError,
    StorageBusy,
    StorageError,
    IpcUnavailable,
    InternalError,
    DesktopUnsupported,
    DesktopError,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UndoDto {
    pub token: Id,
    pub action: UndoAction,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextDto {
    pub revision: Revision,
    pub today: Day,
    pub reporting_timezone: Timezone,
    pub timezone_fallback: bool,
    #[serde(deserialize_with = "required_nullable")]
    pub undo: Option<UndoDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDto {
    pub id: Id,
    pub title: String,
    #[serde(deserialize_with = "required_nullable")]
    pub planned_day: Option<Day>,
    pub completed: bool,
    pub created_at: UtcInstant,
    pub updated_at: UtcInstant,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryItemDto {
    pub completion_id: Id,
    pub task_id: Id,
    pub title_snapshot: String,
    #[serde(deserialize_with = "required_nullable")]
    pub planned_day_snapshot: Option<Day>,
    pub completed_at: UtcInstant,
    pub completed_day: Day,
    pub completion_timezone: Timezone,
    pub task_deleted: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PageRequest {
    pub offset: u32,
    pub limit: u32,
    #[serde(deserialize_with = "required_nullable")]
    pub revision: Option<Revision>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageDto<T> {
    pub items: Vec<T>,
    pub total: u32,
    #[serde(deserialize_with = "required_nullable")]
    pub next_offset: Option<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskMutationDto {
    pub context: ContextDto,
    pub task_id: Id,
    pub changed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsDto {
    pub theme: Theme,
    pub reporting_timezone: Timezone,
    pub timezone_fallback: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoveryBackupDto {
    pub path: String,
    pub completed_at: UtcInstant,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcError {
    pub code: ErrorCode,
    pub message: String,
    #[serde(deserialize_with = "required_nullable")]
    pub field: Option<String>,
    pub retryable: bool,
    pub outcome: ErrorOutcome,
    #[serde(deserialize_with = "required_nullable")]
    pub recovery_backup: Option<RecoveryBackupDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct EmptyRequest {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ListTasksRequest {
    pub view: TaskView,
    pub page: PageRequest,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateTaskRequest {
    pub id: Id,
    pub title: String,
    pub target: TaskTarget,
    pub completed: bool,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct EditTaskRequest {
    pub task_id: Id,
    pub title: String,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MoveTaskRequest {
    pub task_id: Id,
    pub target: TaskTarget,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TaskIdRequest {
    pub task_id: Id,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct UndoLastRequest {
    pub token: Id,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GetStatsRequest {
    pub from_day: Day,
    pub to_day: Day,
    #[serde(deserialize_with = "required_nullable")]
    pub revision: Option<Revision>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ListHistoryRequest {
    pub day: Day,
    pub page: PageRequest,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SetThemeRequest {
    pub theme: Theme,
    pub expected_revision: Revision,
}

/// Wire-level confirmation must be the JSON boolean true, not a truthy value.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(try_from = "bool", into = "bool")]
pub struct Confirmation;

impl TryFrom<bool> for Confirmation {
    type Error = &'static str;
    fn try_from(value: bool) -> Result<Self, Self::Error> {
        if value {
            Ok(Self)
        } else {
            Err("restore requires confirmed: true")
        }
    }
}
impl From<Confirmation> for bool {
    fn from(_: Confirmation) -> Self {
        true
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RestoreDataRequest {
    pub preview_token: Id,
    pub confirmed: Confirmation,
    pub expected_revision: Revision,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListTasksDto {
    pub context: ContextDto,
    pub page: PageDto<TaskDto>,
    pub pending_count: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DayCountDto {
    pub day: Day,
    pub count: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsDto {
    pub context: ContextDto,
    pub from_day: Day,
    pub to_day: Day,
    pub days: Vec<DayCountDto>,
    pub total: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListHistoryDto {
    pub context: ContextDto,
    pub day: Day,
    pub page: PageDto<HistoryItemDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetSettingsDto {
    pub context: ContextDto,
    pub settings: SettingsDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetThemeDto {
    pub context: ContextDto,
    pub settings: SettingsDto,
    pub changed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "status", deny_unknown_fields)]
pub enum ExportDataDto {
    Cancelled {},
    Exported {
        path: String,
        revision: Revision,
        #[serde(rename = "formatVersion")]
        format_version: u32,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "status", deny_unknown_fields)]
pub enum RestorePreviewDto {
    Cancelled {},
    Ready {
        #[serde(rename = "previewToken")]
        preview_token: Id,
        #[serde(rename = "fileName")]
        file_name: String,
        #[serde(rename = "formatVersion")]
        format_version: u32,
        #[serde(rename = "taskCount")]
        task_count: u32,
        #[serde(rename = "completionCount")]
        completion_count: u32,
        #[serde(rename = "reportingTimezone")]
        reporting_timezone: Timezone,
        theme: Theme,
        #[serde(rename = "expiresAt")]
        expires_at: UtcInstant,
        #[serde(rename = "replacesAllData")]
        replaces_all_data: Confirmation,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreDataDto {
    pub context: ContextDto,
    pub backup_path: String,
    pub task_count: u32,
    pub completion_count: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreRecoveryDto {
    pub backup_directory: String,
    #[serde(deserialize_with = "required_nullable")]
    pub latest_backup: Option<RecoveryBackupDto>,
}

#[cfg(test)]
mod tests;
