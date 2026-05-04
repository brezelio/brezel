<?php

set_time_limit(0);

echo "Starting Cron Scheduler...\n";

while (true) {
    echo "[" . date('H:i:s') . "] Running schedule...\n";

    // Pass execution to the main bakery script
    // Using passthru to output logs directly to the terminal pane
    passthru('php bakery schedule');

    sleep(60);
}
