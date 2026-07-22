import {addSet, editSet, deleteSet, applySets, applySetContents} from "./set.js";
import {applyAddItemList, applyItemInputEvent, addItem} from "./item.js";
import {applyLotteryCountMax, lottery} from "./lottery.js";
import {changeAppearanceMode} from "./settings.js";

const INVALID_STRING = new RegExp(/^(\s|\n)*$/);
const MIN_LOTTERY_COUNT = 1;
const MIN_ITEM_COUNT = 2;
let data;

function showDetails(e) {
    const details = document.getElementById(e.dataset.target);
    details.classList.toggle("open");
}

function applyData() {
    const storage = localStorage.getItem("custom_fortune_slip");
    if(storage) {
        data = JSON.parse(storage);
    } else {
        data = {
            insert: {
                setName: "",
                items: [{
                    name: "",
                    description: ""
                }, {
                    name: "",
                    description: ""
                }],
                description: ""
            }
        };
    }
    const setNameEle = document.getElementById("set-name");
    setNameEle.value = data.insert?.setName ?? "";
    console.log(data.insert?.items);
    if((data.insert?.items?.length ?? 0) > 0) {
        applyAddItemList(data, MIN_ITEM_COUNT, {
            saveData: saveData,
            nameValidation: nameValidation
        });
    }
    const setDescriptionEle = document.getElementById("set-description");
    setDescriptionEle.value = data.insert?.description ?? "";
    if(data.settings?.appearanceMode) {
        const targetEle = document.getElementById(data.settings.appearanceMode);
        if(targetEle) {
            targetEle.checked = true;
        }
    }
}

function saveData() {
    localStorage.setItem("custom_fortune_slip", JSON.stringify(data));
}

function showAddOrEdit() {
    const addEditSetTitleEle = document.getElementById("add-edit-set-title");
    const addSetButtonEle = document.getElementById("add-set-button");
    if(typeof data.insert?.editId !== "number") {
        addEditSetTitleEle.textContent = "Step4. 全て入力したら追加する";
        addSetButtonEle.textContent = "+おみくじを追加";
    } else {
        addEditSetTitleEle.textContent = "Step4. 全て入力したら編集する";
        addSetButtonEle.textContent = "✔︎編集完了";
    }
}

function supplementTheData() {
    if(!data.insert) {
        data.insert = {
            setName: "",
            items: [{
                name: ""
            }],
            description: "",
            editId: null
        };
    }
    if(!data.set) {
        data.set = [];
    }
    if(!data.settings) {
        data.settings = {};
    }
    saveData();
}

function changeName(ele) {
    const attribute = ele.dataset.attribute;
    console.log(attribute);
    supplementTheData();
    const index = parseInt(ele.dataset.id);
    switch(attribute) {
        case "set-name":
            data.insert.setName = ele.value;
            break;
        case "item-name":
            if (!isNaN(index) && index < (data.insert?.items?.length ?? 0)) {
                data.insert.items[index].name = ele.value;
            }
            break;
        case "item-description":
            if (!isNaN(index) && index < (data.insert?.items?.length ?? 0)) {
                data.insert.items[index].description = ele.value;
            }
            break;
        case "description":
            data.insert.description = ele.value;
            break;
    }
    saveData();
}

function resetAlert(attribute) {
    const alertEles = Array.from(document.querySelectorAll(`.invalid-value-alert${attribute ? `.${attribute}` : ""}, .invalid-value-alert${attribute ? `.${attribute}` : ""}-title`));
    alertEles.forEach((a) => {
        a.style.display = "none";
    });
    return alertEles;
}

function nameValidation(ele) {
    const attribute = ele.dataset.attribute;
    let showAlertEles = [];
    const alertEles = resetAlert(attribute);
    const inputEles = Array.from(document.querySelectorAll("input[name='item-input']"));
    switch(attribute) {
        case "set-name":
            if(INVALID_STRING.test(ele.value)) {
                const setNameTitleEles = alertEles.filter((a) => a.classList.contains("set-name-title"));
                const setNameEles = alertEles.filter((a) => a.classList.contains("set-name"));
                showAlertEles.push(...setNameTitleEles, ...setNameEles);
            }
            break;
        case "item-name":
            if(INVALID_STRING.test(ele.value)) {
                const itemNameEles = alertEles.filter((a) => a.classList.contains("item-name") && a.dataset.id === ele.dataset.id);
                showAlertEles.push(...itemNameEles);
            }
            if(inputEles.filter((i) => !(INVALID_STRING.test(i.value))).length < MIN_ITEM_COUNT) {
                const itemNameTitleEles = alertEles.filter((a) => a.classList.contains("item-name-title"));
                showAlertEles.push(...itemNameTitleEles);
            }
            break;
        case "set-selector":
            if(!ele.value) {
                const setSelectorEles = alertEles.filter((a) => a.classList.contains("set-selector"));
                showAlertEles.push(...setSelectorEles);
            }
            const lotteryCountAlertEles = alertEles.filter((a) => a.classList.contains("lottery-count"));
            lotteryCountAlertEles.forEach((a) => {
                a.style.display = "none";
            });
            break;
        case "lottery-count":
            const num = Number(ele.value);
            const checkedEle = Array.from(document.querySelectorAll("input[name='items-to-use']:checked"));
            if(!ele.value || isNaN(num) || num < MIN_LOTTERY_COUNT || num > Number(ele.max) || num > checkedEle.length) {
                const lotteryCountEles = alertEles.filter((a) => a.classList.contains("lottery-count"));
                showAlertEles.push(...lotteryCountEles);
            }
            break;
    }
    showAlertEles.forEach((a) => {
        a.style.display = "inline";
    });
    changeName(ele);
}

function jumpToStep(ele) {
    const jumpPos = ele.dataset.jumpPos;
    const stepEle = document.getElementById(jumpPos);
    if(stepEle) {
        const scrollY = window.scrollY;
        const pos = (stepEle.getBoundingClientRect().y) + scrollY;
        window.scrollTo({
            top: pos,
            behavior: "smooth"
        });
    }
}

window.onload = function() {
    const jumpButtonEles = document.querySelectorAll(".jump-button");
    jumpButtonEles.forEach((b) => {
        b.addEventListener("click", () => {
            jumpToStep(b);
        });
    });
    const setNameEle = document.getElementById("set-name");
    setNameEle.addEventListener("input", () => {
        nameValidation(setNameEle);
    });
    setNameEle.addEventListener("blur", () => {
        nameValidation(setNameEle);
    });
    const addItemButtonEle = document.getElementById("add-item-button");
    addItemButtonEle.addEventListener("click", () => {
        addItem(data, MIN_ITEM_COUNT, {
            supplementTheData: supplementTheData,
            saveData: saveData,
            nameValidation: nameValidation
        });
    });
    const setDescriptionEle = document.getElementById("set-description");
    setDescriptionEle.addEventListener("input", () => {
        changeName(setDescriptionEle);
    });
    const addSetButtonEle = document.getElementById("add-set-button");
    addSetButtonEle.addEventListener("click", () => {
        addSet(data, INVALID_STRING, MIN_ITEM_COUNT, {
            nameValidation: nameValidation,
            supplementTheData: supplementTheData,
            saveData: saveData,
            applyAddItemList: applyAddItemList,
            showAddOrEdit: showAddOrEdit,
            applyLotteryCountMax: applyLotteryCountMax
        });
    });
    const setSelectorEle = document.getElementById("set-selector");
    const lotteryCountEle = document.getElementById("lottery-count");
    setSelectorEle.addEventListener("change", () => {
        nameValidation(setSelectorEle);
        applyLotteryCountMax(data);
        nameValidation(lotteryCountEle);
        applySetContents(data, {
            applyLotteryCountMax: applyLotteryCountMax,
            nameValidation: nameValidation
        });
        const lotteryResultsEle = document.getElementById("lottery-results");
        lotteryResultsEle.innerHTML = "";
    });
    setSelectorEle.addEventListener("blur", () => {
        nameValidation(setSelectorEle);
    });
    lotteryCountEle.addEventListener("input", () => {
        nameValidation(lotteryCountEle);
    });
    lotteryCountEle.addEventListener("blur", () => {
        nameValidation(lotteryCountEle);
    });
    const lotteryButtonEle = document.getElementById("lottery-button");
    lotteryButtonEle.addEventListener("click", () => {
        lottery(data, MIN_LOTTERY_COUNT, MIN_ITEM_COUNT, {
            nameValidation: nameValidation
        });
    });
    const editSetButtonEle = document.getElementById("edit-set-button");
    editSetButtonEle.addEventListener("click", () => {
        editSet(data, MIN_ITEM_COUNT, {
            nameValidation: nameValidation,
            supplementTheData: supplementTheData,
            applyAddItemList: applyAddItemList,
            resetAlert: resetAlert,
            saveData: saveData,
            showAddOrEdit: showAddOrEdit
        });
    });
    const deleteSetButtonEle = document.getElementById("delete-set-button");
    deleteSetButtonEle.addEventListener("click", () => {
        deleteSet(data, {
            nameValidation: nameValidation,
            showAddOrEdit: showAddOrEdit,
            saveData: saveData,
            applyLotteryCountMax: applyLotteryCountMax
        });
    });
    const appearanceModeButtonEles = document.querySelectorAll(".appearance-mode-button");
    appearanceModeButtonEles.forEach((b) => {
        b.addEventListener("click", () => {
            changeAppearanceMode(b.dataset.target, data, {
                saveData: saveData,
                supplementTheData: supplementTheData
            });
        });
    });
    const detailsButtonEles = document.querySelectorAll(".details-button");
    detailsButtonEles.forEach((b) => {
        b.addEventListener("click", () => {
            showDetails(b);
        });
    });
    applyItemInputEvent({
        nameValidation: nameValidation
    });
    applyData();
    applySets(data);
    showAddOrEdit();
}