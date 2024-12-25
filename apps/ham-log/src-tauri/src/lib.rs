use std::{
    collections::HashMap,
    sync::{atomic::AtomicBool, Arc, Mutex},
};

mod telnet;
mod udp;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .manage(AppState {
            udp_listeners: Arc::new(Mutex::new(HashMap::new())),
            telnet_connections: Arc::new(Mutex::new(HashMap::new())),
            telnet_send_queues: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            udp::start_listener,
            udp::is_listener_running,
            udp::stop_listener,
            telnet::telnet_start,
            telnet::telnet_send,
            telnet::is_telnet_running,
            telnet::telnet_stop
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
    telnet_connections: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>,
    telnet_send_queues: Arc<Mutex<HashMap<String, Arc<Mutex<Vec<u8>>>>>>,
}
