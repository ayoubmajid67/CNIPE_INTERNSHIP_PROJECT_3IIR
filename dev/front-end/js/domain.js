const webContainer = document.querySelector(".domainContent");
const blackDrop = document.querySelector(".blackDrop");
const deletePopUpBox = document.querySelector(".deletePopup");
const deleteDomainNameBox = deletePopUpBox.querySelector(".popUpDomainName");
const deletePopUpBtn = deletePopUpBox.querySelector(".popupButtonDelete");
const boxModeClass = "activeBox";
const editStatClass = "editStat";
const addPopUpBox = document.querySelector(".addPopup");
const addPopUpNameInput = addPopUpBox.querySelector(".domainTitleInput");
const addPopUpDescriptionInput = addPopUpBox.querySelector(".descriptionInput");
const addPopUpFileInput = addPopUpBox.querySelector("input[type='file']");

function setDisablePopUpBoxMode() {
	deletePopUpBox.classList.remove(boxModeClass);
	addPopUpBox.classList.remove(boxModeClass);
	blackDrop.classList.remove(boxModeClass);
	cardBox = webContainer.querySelector(".card.deleteStatus");
	if (cardBox) cardBox.classList.remove("deleteStatus");
	window.onscroll = function () {};
}

function setEnableDeleteMode(cardBox) {
	blackDrop.classList.add(boxModeClass);
	deletePopUpBox.classList.add(boxModeClass);
	if(cardBox)
	cardBox.classList.add("deleteStatus");
	let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	window.onscroll = function () {
		scrollToPositionHard(scrollTop);
	};
}

function setEnableAddDomainMode() {
	blackDrop.classList.add(boxModeClass);
	addPopUpBox.classList.add(boxModeClass);

	let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	window.onscroll = function () {
		scrollToPositionHard(scrollTop);
	};
}
function manageAddDomainImgFileChange(event) {
	updateFileBackground(event);
}

window.addEventListener("click", function (event) {
	if (event.target == blackDrop || event.target.classList.contains("popupButtonCancel")) {
		setDisablePopUpBoxMode();
		window.onscroll = function () {};
	}
});

function setUpDeleteBoxToShow(domainName,courseName) {
	deletePopUpBox.setAttribute("categoryName", domainName);
	if(courseName)
	deletePopUpBox.setAttribute("courseName", courseName);
	deleteDomainNameBox.textContent = domainName;
}
