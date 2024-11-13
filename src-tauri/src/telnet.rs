use std::{
    sync::{atomic::AtomicBool, Arc, Mutex},
    thread,
    time::Duration,
};

use tauri::{AppHandle, Emitter, State};
use telnet::{Event, Telnet};

use crate::AppState;

#[tauri::command]
pub fn telnet_start(host: &str, port: u16, label: &str, state: State<AppState>, app: AppHandle) {
    let telnet_conns = state.telnet_connections.clone();
    let msg_queues = state.telnet_send_queues.clone();

    let stop_signal = Arc::new(AtomicBool::new(false));
    telnet_conns
        .lock()
        .unwrap()
        .insert(label.to_string(), stop_signal.clone());

    let msg_queue = Arc::new(Mutex::new(Vec::new()));
    msg_queues
        .lock()
        .unwrap()
        .insert(label.to_string(), msg_queue.clone());

    let label_copy = label.to_string();
    let host_copy = host.to_string();

    thread::spawn(move || {
        let mut telnet =
            Telnet::connect((host_copy, port), 1024).expect("Failed to connect to telnet");

        println!("Telnet connection established");
        while !stop_signal.load(std::sync::atomic::Ordering::Relaxed) {
            let res = telnet.read_timeout(Duration::from_secs(1));

            match res {
                Ok(event) => {
                    if let Event::Data(buf) = event {
                        // println!("Received {} bytes from {}", buf.len(), label_copy);
                        app.emit(&label_copy, buf.to_vec()).unwrap();
                    }
                }
                Err(e) => {
                    println!("Received error {}", e);
                    break;
                }
            }

            {
                let mut queue = msg_queue.lock().unwrap();
                if !queue.is_empty() {
                    telnet.write(&queue).expect("Failed to write to telnet");
                    queue.clear();
                }
            }
        }

        println!("Telnet connection closed");
        telnet_conns.lock().unwrap().remove(&label_copy);
        msg_queues.lock().unwrap().remove(&label_copy);
    });
}

#[tauri::command]
pub fn telnet_send(data: &[u8], label: &str, state: State<AppState>) {
    let queues = state.telnet_send_queues.lock().unwrap();
    if !queues.contains_key(&label.to_string()) {
        return;
    }
    let mut queue = queues.get(&label.to_string()).unwrap().lock().unwrap();
    queue.extend_from_slice(data);
}

#[tauri::command]
pub fn is_telnet_running(label: &str, state: State<AppState>) -> bool {
    state
        .telnet_connections
        .lock()
        .unwrap()
        .contains_key(&label.to_string())
}

#[tauri::command]
pub fn telnet_stop(label: &str, state: State<AppState>) {
    let connections = state.telnet_connections.lock().unwrap();
    if !connections.contains_key(&label.to_string()) {
        return;
    }
    connections
        .get(&label.to_string())
        .unwrap()
        .store(true, std::sync::atomic::Ordering::Relaxed);
}
