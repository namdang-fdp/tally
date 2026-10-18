mod profiles;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let root = app.path().data_dir().map_err(std::io::Error::other);
            let data_dir = profiles::resolve_data_dir(root, &app.config().identifier)?;
            app.manage(data_dir);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Tally");
}
