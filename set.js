export function addSet(data, INVALID_STRING, MIN_ITEM_COUNT, f) {
    console.log(data);
    const setName = data.insert?.setName ?? "";
    const judgeSetName = setName.replaceAll(/\s+/g, '');
    const items = data.insert?.items ?? [];
    const judgeItems = items.filter((item) => (item.name && !INVALID_STRING.test(item.name)) && ((!INVALID_STRING.test(item.description ?? "t")) || item.description === ""));
    const description = data.insert?.description ?? "";
    const judgeDescription = description.replaceAll(/(\n|\s+)/g, '');
    console.log(judgeSetName, judgeItems, judgeDescription);
    if(!judgeSetName) {
        const setNameEle = document.getElementById("set-name");
        f.nameValidation(setNameEle);
    }
    if(judgeItems.length < MIN_ITEM_COUNT) {
        const itemEles = Array.from(document.querySelectorAll("input[name='item-input']"));
        const alertEle = itemEles.find((i) => INVALID_STRING.test(i.value));
        if (alertEle) {
            f.nameValidation(alertEle);
        }
    }
    if(!judgeSetName || judgeItems.length < MIN_ITEM_COUNT) {
        alert("入力内容に問題があります。");
        return;
    }
    f.supplementTheData();
    const dataToBeUsed = {
        setName: setName,
        items: judgeItems,
        description: (INVALID_STRING.test(description) ? "" : description)
    };
    if(typeof data.insert?.editId !== "number") {
        data.set.push(dataToBeUsed);
    } else {
        data.set[data.insert?.editId ?? 0] = dataToBeUsed;
    }
    data.insert = {
        setName: "",
        items: [{
            name: "",
            description: ""
        }, {
            name: "",
            description: ""
        }],
        description: "",
        editId: null
    };
    const nameInputEles = document.querySelectorAll("input[type='text']");
    nameInputEles.forEach((i) => {
        i.value = "";
    });
    const setDescriptionEle = document.getElementById("set-description");
    setDescriptionEle.value = "";
    f.saveData();
    f.applyAddItemList(data, MIN_ITEM_COUNT, {
        nameValidation: f.nameValidation
    });
    applySets(data);
    f.showAddOrEdit();
    applySetContents(data, {
        applyLotteryCountMax: f.applyLotteryCountMax,
        nameValidation: f.nameValidation
    });
}

export function editSet(data, MIN_ITEM_COUNT, f) {
    const setSelectorEle = document.getElementById("set-selector");
    const selectedId = setSelectorEle.value;
    if(selectedId === "") {
        alert("おみくじが選択されていないため編集できません。");
        f.nameValidation(setSelectorEle);
        return;
    }
    f.supplementTheData();
    data.insert = {
        ...data.set[Number(selectedId)],
        editId: Number(selectedId)
    };
    f.applyAddItemList(data, MIN_ITEM_COUNT, {
        nameValidation: f.nameValidation
    });
    const setNameEle = document.getElementById("set-name");
    setNameEle.value = data.insert?.setName ?? "";
    const descriptionEle = document.getElementById("set-description");
    descriptionEle.value = data.insert?.description ?? "";
    f.resetAlert();
    f.saveData();
    f.showAddOrEdit();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

export function deleteSet(data, f) {
    const setSelectorEle = document.getElementById("set-selector");
    const selectedId = setSelectorEle.value;
    if(selectedId === "") {
        alert("おみくじが選択されていないため削除できません。");
        f.nameValidation(setSelectorEle);
        return;
    }
    if(confirm(`本当に${data.set[Number(selectedId)]?.setName ?? "選択されたおみくじ"}を削除しますか？`)) {
        setSelectorEle.value = "";
        data.set.splice(Number(selectedId), 1);
        data.insert.editId = null;
        f.showAddOrEdit();
        applySets(data);
        applySetContents(data, {
            applyLotteryCountMax: f.applyLotteryCountMax,
            nameValidation: f.nameValidation
        });
        f.saveData();
    }
}

export function applySets(data) {
    const lotteryEditGroupEle = document.getElementById("lottery-edit-group");
    const lotteryEditJumpGroupEle = document.getElementById("lottery-edit-jump-group");
    if((data.set?.length ?? 0) <= 0) {
        lotteryEditGroupEle.style.display = "none";
        lotteryEditJumpGroupEle.style.display = "none";
        return;
    }
    const setSelectorEle = document.getElementById("set-selector");
    const id = setSelectorEle.value;
    setSelectorEle.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "--おみくじを選択してください。";
    if(id === "") {
        defaultOpt.selected = true;
    }
    defaultOpt.disabled = true;
    setSelectorEle.appendChild(defaultOpt);
    (data.set ?? []).forEach((set, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = set.setName;
        if(Number(id) === index && id !== "") {
            opt.selected = true;
        }
        setSelectorEle.appendChild(opt);
    });
    lotteryEditGroupEle.style.display = "block";
    lotteryEditJumpGroupEle.style.display = "grid";
}

export function applySetContents(data, f) {
    const setSelectorEle = document.getElementById("set-selector");
    const setContentsEle = document.getElementById("set-contents");
    setContentsEle.innerHTML = "";
    if(setSelectorEle.value === "") {
        return;
    }
    const id = Number(setSelectorEle.value);
    console.log(data);
    const set = data.set?.[id];
    const itemsTitle = document.createElement("h3");
    itemsTitle.textContent = "くじ一覧";
    const itemsGroup = document.createElement("div");
    const buttonGroup = document.createElement("div");
    const allSelectButton = document.createElement("button");
    allSelectButton.textContent = "✔︎全て選択";
    const lotteryCountEle = document.getElementById("lottery-count");
    allSelectButton.addEventListener("click", () => {
        operateAllItems(true);
        f.nameValidation(lotteryCountEle);
    });
    const allClearButton = document.createElement("button");
    allClearButton.textContent = "×全て選択解除";
    allClearButton.addEventListener("click", () => {
        operateAllItems(false);
        f.nameValidation(lotteryCountEle);
    });
    buttonGroup.append(allSelectButton, allClearButton);
    (set.items ?? []).forEach((item, index) => {
        const group = document.createElement("div");
        group.classList.add("item-group");
        const itemEle = document.createElement("h4");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "items-to-use";
        checkbox.dataset.id = index;
        checkbox.checked = true;
        checkbox.addEventListener("change", () => {
            f.nameValidation(lotteryCountEle);
        });
        itemEle.append(checkbox, (item.name ?? "読み込みエラー"));
        group.append(itemEle);
        if(item.description) {
            const itemDescriptionGroup = document.createElement("div");
            const itemDescriptionTitle = document.createElement("b");
            itemDescriptionTitle.textContent = "運勢";
            const itemDescriptionList = (item.description ?? "").split("\n");
            itemDescriptionList.forEach((d) => {
                const itemDescription = document.createElement("div");
                itemDescription.textContent = d;
                itemDescriptionGroup.append(itemDescription);
            });
            group.append(itemDescriptionTitle, itemDescriptionGroup);
        }
        itemsGroup.append(group);
    });
    setContentsEle.append(itemsTitle, buttonGroup, itemsGroup);
    if(set.description) {
        const descriptionTitle = document.createElement("h3");
        descriptionTitle.textContent = "説明";
        setContentsEle.append(descriptionTitle);
        const description = set.description.split("\n");
        description.forEach((d) => {
            const descriptionEle = document.createElement("p");
            descriptionEle.textContent = d;
            setContentsEle.append(descriptionEle);
        });
    }
    f.applyLotteryCountMax(data);
    f.nameValidation(lotteryCountEle);
}

function operateAllItems(bool) {
    const checkbox = document.querySelectorAll("input[name='items-to-use']");
    checkbox.forEach((c) => {
        c.checked = bool;
    });
}