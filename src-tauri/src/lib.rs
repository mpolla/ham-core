use std::{
    collections::HashMap,
    sync::{atomic::AtomicBool, Arc, Mutex},
};
mod udp;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            udp_listeners: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            udp::start_listener,
            udp::is_listener_running,
            udp::stop_listener
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub struct AppState {
    udp_listeners: Arc<Mutex<HashMap<u16, Arc<AtomicBool>>>>,
}
