function saveSettings(){

    const crop =
    document.getElementById("cropType").value;

    const threshold =
    document.getElementById("threshold").value;

    const mode =
    document.getElementById("mode").value;

    localStorage.setItem(
        "crop",
        crop
    );

    localStorage.setItem(
        "threshold",
        threshold
    );

    localStorage.setItem(
        "mode",
        mode
    );

    showToast("✅ Settings Saved");
}