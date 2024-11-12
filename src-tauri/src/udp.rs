use crate::AppState;
use std::{
    sync::{atomic::AtomicBool, Arc},
    time::Duration,
};
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn start_listener(port: u16, label: &str, state: State<AppState>, app: AppHandle) {
    let udp_listeners = state.udp_listeners.clone();

    let stop_signal = Arc::new(AtomicBool::new(false));
    udp_listeners
        .lock()
        .unwrap()
        .insert(port, stop_signal.clone());

    let label_copy = label.to_string();

    // Start a thread that listens for incoming UDP packets on the specified port
    std::thread::spawn(move || {
        let socket = std::net::UdpSocket::bind(("0.0.0.0", port)).unwrap();
        socket
            .set_read_timeout(Some(Duration::from_secs(1)))
            .unwrap();

        println!("WSJT Listener started");
        while !stop_signal.load(std::sync::atomic::Ordering::Relaxed) {
            let mut buf = [0; 1024];
            let res = socket.recv_from(&mut buf);

            match res {
                Ok((amt, _)) => {
                    // println!(
                    //     "Received {} bytes from {}",
                    //     amt,
                    //     socket.local_addr().unwrap()
                    // );
                    app.emit(&label_copy, buf[0..amt].to_vec()).unwrap();
                }
                Err(_e) => {
                    // println!("Received 0 bytes");
                }
            }
        }

        println!("WSJT Listener stopped");
        udp_listeners.lock().unwrap().remove(&port);
    });
}

#[tauri::command]
pub fn is_listener_running(port: u16, state: State<AppState>) -> bool {
    state.udp_listeners.lock().unwrap().contains_key(&port)
}

#[tauri::command]
pub fn stop_listener(port: u16, state: State<AppState>) {
    if !state.udp_listeners.lock().unwrap().contains_key(&port) {
        return;
    }
    state
        .udp_listeners
        .lock()
        .unwrap()
        .get(&port)
        .unwrap()
        .store(true, std::sync::atomic::Ordering::Relaxed);
}
