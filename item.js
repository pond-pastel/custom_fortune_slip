export function applyAddItemList(data, MIN_ITEM_COUNT, MIN_PROBABILITY, f) {
    console.log(f);
    const addItemList = document.getElementById("add-item-list");
    addItemList.innerHTML = "";
    (data.insert?.items ?? []).forEach((item, index) => {
        const group = document.createElement("div");
        group.classList.add("item-group");
        group.dataset.id = index;
        const title = document.createElement("h4");
        title.textContent = `くじ(${index + 1})`;
        const nameGroup = document.createElement("p");
        const input = document.createElement("input");
        input.type = "text";
        input.name = "item-input";
        input.dataset.id = index;
        input.dataset.attribute = "item-name";
        input.placeholder = `美味しい料理吉`;
        input.value = item.name ?? "";
        const alert = document.createElement("span");
        alert.classList.add("invalid-value-alert", "item-name");
        alert.dataset.id = index;
        alert.style.display = "none";
        nameGroup.append("名前(*): ", input, alert);
        const probabilityGroup = document.createElement("p");
        const probability = document.createElement("input");
        probability.type = "number";
        probability.name = "item-probability";
        probability.dataset.id = index;
        probability.dataset.attribute = "item-probability";
        probability.placeholder = MIN_PROBABILITY;
        probability.min = MIN_PROBABILITY;
        probability.value = item.probability ?? MIN_PROBABILITY;
        const probabilityAlert = document.createElement("span");
        probabilityAlert.classList.add("invalid-value-alert", "item-probability");
        probabilityAlert.dataset.id = index;
        probabilityAlert.style.display = "none";
        probabilityGroup.append("出やすさ(*): ", probability, probabilityAlert);
        const descriptionGroup = document.createElement("p");
        const description = document.createElement("textarea");
        description.name = "item-description";
        description.dataset.id = index;
        description.dataset.attribute = "item-description";
        description.placeholder = `美味しい料理が食べられるでしょう。`;
        description.value = item.description ?? "";
        descriptionGroup.append("運勢(入力しなかった場合、運勢は追加されません。)", description);
        group.append(title, probabilityGroup, nameGroup, descriptionGroup);
        if((data.insert?.items?.length ?? 0) > MIN_ITEM_COUNT) {
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-item-button");
            deleteButton.textContent = "削除";
            deleteButton.dataset.id = index;
            deleteButton.addEventListener("click", () => {
                deleteItem(deleteButton, data, MIN_ITEM_COUNT, MIN_PROBABILITY, {
                    saveData: f.saveData,
                    nameValidation: f.nameValidation
                });
            });
            group.append(deleteButton);
        }
        addItemList.append(group);
    });
    applyItemInputEvent({
        nameValidation: f.nameValidation
    });
}

export function applyItemInputEvent(f) {
    const inputEles = document.querySelectorAll("input[name='item-probability'], input[name='item-input'], textarea[name='item-description']");
    inputEles.forEach((i) => {
        i.addEventListener("input", () => {
            f.nameValidation(i);
        });
        i.addEventListener("blur", () => {
            f.nameValidation(i);
        });
    });
}

export function addItem(data, MIN_ITEM_COUNT, MIN_PROBABILITY, f) {
    f.supplementTheData();
    data.insert.items.push({
        name: "",
        description: "",
        probability: MIN_PROBABILITY,
        use: true
    });
    applyAddItemList(data, MIN_ITEM_COUNT, MIN_PROBABILITY, {
        saveData: f.saveData,
        nameValidation: f.nameValidation
    });
    f.saveData();
}

export function deleteItem(ele, data, MIN_ITEM_COUNT, MIN_PROBABILITY, f) {
    const id = Number(ele.dataset.id);
    if((data.insert?.items?.length ?? 0) <= MIN_ITEM_COUNT) {
        alert(`くじを削除するには${MIN_ITEM_COUNT + 1}個以上のくじが必要です。`);
        return;
    }
    if (!isNaN(id)) {
        const itemName = Boolean(data.insert?.items?.[id]?.name) ? data.insert.items[id].name : `くじ(${id + 1})`;
        if(confirm(`本当に${itemName}を削除しますか？`)) {
            data.insert.items.splice(id, 1);
            applyAddItemList(data, MIN_ITEM_COUNT, MIN_PROBABILITY, {
                saveData: f.saveData,
                nameValidation: f.nameValidation
            });
            f.saveData();
        }
    }
}