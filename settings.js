export function changeAppearanceMode(mode, data, f) {
    const targetEle = document.getElementById(mode);
    if(targetEle) {
        targetEle.checked = true;
    }
    saveAppearanceMode(mode, data, f);
}

export function saveAppearanceMode(mode, data, f) {
    f.supplementTheData();
    data.settings.appearanceMode = mode;
    f.saveData();
}