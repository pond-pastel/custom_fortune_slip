export function applyLotteryCountMax(data) {
    const lotteryCountEle = document.getElementById("lottery-count");
    const setSelectorEle = document.getElementById("set-selector");
    if(lotteryCountEle) {
        lotteryCountEle.max = (data.set?.[Number(setSelectorEle.value)]?.items?.length ?? 0);
    }
}

export function lottery(data, MIN_LOTTERY_COUNT, MIN_ITEM_COUNT, f) {
    const resultsEle = document.getElementById("lottery-results");
    resultsEle.innerHTML = "";
    const setSelectorEle = document.getElementById("set-selector");
    const id = Number(setSelectorEle.value);
    const lotteryCountEle = document.getElementById("lottery-count");
    const lotteryCount = Number(lotteryCountEle.value);
    if(setSelectorEle.value === "") {
        f.nameValidation(setSelectorEle);
    }
    if(isNaN(lotteryCount) || lotteryCount < MIN_LOTTERY_COUNT || lotteryCount > (data.set?.[id]?.items?.length ?? 0)) {
        f.nameValidation(lotteryCountEle);
    }
    if(setSelectorEle.value === "" || isNaN(lotteryCount) || lotteryCount < MIN_LOTTERY_COUNT || lotteryCount > (data.set?.[id]?.items?.length ?? 0)) {
        alert("正しく設定されていないため抽選できません。");
        return;
    }
    const title = document.createElement("h3");
    title.textContent = "抽選結果";
    //let results = Array.from(data.set?.[id]?.items ?? []);
    let results = [];
    for(let i = 0; i < (data.set?.[id]?.items?.length ?? 0); i++) {
        const checkboxEle = document.querySelector(`input[name="items-to-use"][data-id="${i}"]`);
        if(checkboxEle && checkboxEle.checked) {
            console.log("push");
            results.push((data.set?.[id]?.items?.[i]) ?? {});
        }
    }
    if(results.length < MIN_ITEM_COUNT) {
        alert(`抽選するにはくじを${MIN_ITEM_COUNT}個以上選択してください。`);
        return;
    }
    if(results.length < lotteryCount) {
        alert(`くじを追加で選択するか、抽選する数を減らしてください。`);
        return;
    }
    for(let i = 0; i < results.length; i++) {
        const rand = Math.floor(Math.random() * (i + 1));
        [results[i], results[rand]] = [results[rand], results[i]];
    }
    console.log(results);
    const ol = document.createElement("ol");
    ol.classList.add("lottery-results-list");
    for(let i = 0; i < lotteryCount; i++) {
        const li = document.createElement("li");
        li.textContent = results[i]?.name;
        if(results[i]?.description) {
            const descriptionGroup = document.createElement("p");
            const descriptionTitle = document.createElement("b");
            descriptionTitle.textContent = "運勢";
            descriptionGroup.append(descriptionTitle);
            const descriptionList = results[i]?.description.split("\n");
            if (descriptionList) {
                descriptionList.forEach((d) => {
                    const description = document.createElement("div");
                    description.textContent = d;
                    descriptionGroup.append(description);
                });
            }
            li.append(descriptionGroup);
        }
        ol.appendChild(li);
    }
    resultsEle.append(title, ol);
}