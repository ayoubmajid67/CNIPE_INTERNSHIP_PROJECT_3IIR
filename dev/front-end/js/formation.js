searchInput.addEventListener("input", () => {
	filterContainers("courseName");
});

let beforeEditInfo = {
	imgContainerContent: "",
	title: "",
	description: "",
};

let cardChangedFiledInfo = {
	domainImg: false,
	domainTitle: false,
	domainDescription: false,
};

let saveValuesInfo = {
	domainImg: "",
	domainTitle: "",
	domainDescription: "",
	imgUrl: "",
};

const hiddenIntroVideoClass = "hidden";
const formationInfoContainer = document.getElementById("formationInfo");
const introVideoContainer = formationInfoContainer.querySelector(".introVideo");

const categoryNameBox = formationInfoContainer.querySelector(".textInfo .categoryName span");
const categoryDescriptionBox = formationInfoContainer.querySelector(".textInfo .categoryDescription span");

function setUpEditIntroVideoUI() {
	const introVideoBox = formationInfoContainer.querySelector(".introVideo video");
	const introVideoHeight = introVideoBox.clientHeight;
	introVideoBox.classList.add(hiddenIntroVideoClass);

	if (!introVideoContainer.querySelector(".imgContainer"))
		introVideoContainer.innerHTML += `
	<div class="imgContainer" style='height :${introVideoHeight}px'>
	<div class="content " >
										<h4>Choisir un fichier</h4>
										<img  src="imgs/addPost.svg" alt="add-image" />
									</div>
									<input type="file" name="image" accept="video/*" onchange="manageIntroVideoFileChange(event)" />
	</div>
									`;
}
let IntroVideoChange = false;
function manageAddIntroVideo(event) {
	const introVideoBox = formationInfoContainer.querySelector("video");
	introVideoBox.classList.remove(hiddenIntroVideoClass);
	let addBtn = event.target;
	addBtn.disabled = true;
	switchBtnHandler(addBtn, "cancel", "Annuler", "cancelEditIntroVideo(event)");
	addBtn.disabled = false;

	const controlContainer = addBtn.parentElement;
	controlContainer.insertAdjacentHTML("beforeend", `<button class="save" onclick=manageSaveIntroVideo(event) disabled>Enregistrer</button>`);

	setUpEditIntroVideoUI();
}
function manageEditIntroVideo(event) {
	const introVideoBox = formationInfoContainer.querySelector("video");
	introVideoBox.classList.remove(hiddenIntroVideoClass);
	let editBtn = event.target;
	editBtn.disabled = true;
	switchBtnHandler(editBtn, "cancel", "Annuler", "cancelEditIntroVideo(event)");
	editBtn.disabled = false;

	const controlContainer = editBtn.parentElement;
	const deleteBtn = controlContainer.querySelector(".delete");
	switchBtnHandler(deleteBtn, "save", "Enregistrer", "manageSaveIntroVideo(event)");
	deleteBtn.disabled = true;
	setUpEditIntroVideoUI();
}
function setOffEditIntroVideoUI() {
	const introVideoBox = formationInfoContainer.querySelector(".introVideo video");
	introVideoBox.classList.remove(hiddenIntroVideoClass);
	const imgContainer = introVideoContainer.querySelector(".imgContainer");

	imgContainer.remove();
}

function cancelEditIntroVideo(event) {
	const introVideoBox = formationInfoContainer.querySelector("video");
	const cancelBtn = event.target;
	const controlContainer = cancelBtn.parentElement;

	const saveEditBtn = controlContainer.querySelector("button.save");
	if (!controlContainer.classList.contains("addVideoStat")) {
		switchBtnHandler(saveEditBtn, "delete", "Supprimer", "manageDeleteIntroVideo(event)");
		saveEditBtn.disabled = false;
		switchBtnHandler(cancelBtn, "edit", "Modifier", "manageEditIntroVideo(event)");
	} else {
		introVideoBox.classList.add(hiddenIntroVideoClass);
		switchBtnHandler(cancelBtn, "add", "Add intro video", "manageAddIntroVideo(event)");
		saveEditBtn.remove();
	}

	setOffEditIntroVideoUI();
}

async function editIntroVideoResponse(categoryName, introVideoFile) {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			throw "Connexion utilisateur invalide";
		}
		const token = localStorage.getItem("userToken");

		// Create a FormData object
		const formData = new FormData();

		formData.append("introVideo", introVideoFile);

		const response = await axios.post(`${baseUrl}/formations/${categoryName}/introVideo`, formData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		const data = response.data;

		return data;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}

async function manageSaveIntroVideo(event) {
	const saveEditBtn = event.target;
	if (!IntroVideoChange) return 0;
	event.target.disabled = true;

	const controlContainer = saveEditBtn.parentElement;

	try {
		let response = await editIntroVideoResponse(controlContainer.getAttribute("categoryName"), IntroVideoChange);

		switchBtnHandler(saveEditBtn, "delete", "Supprimer", "manageDeleteIntroVideo(event)");
		event.target.disabled = false;
		const cancelBtn = controlContainer.querySelector("button.cancel");
		switchBtnHandler(cancelBtn, "edit", "Modifier", "manageEditIntroVideo(event)");

		setOffEditIntroVideoUI();

		if (controlContainer.classList.contains("addVideoStat")) {
			const introVideoBox = formationInfoContainer.querySelector("video");
			introVideoBox.setAttribute("src", response.introVideo);

			controlContainer.classList.remove("addVideoStat");
		}

		await alertHint(response.message, "success");
	} catch (error) {
		await alertHint(error.message, error.type);
	}
}
async function deleteIntroVideoResponse(categoryName) {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			throw "Invalid User login";
		}
		const token = localStorage.getItem("userToken");

		const response = await axios.delete(`${baseUrl}/formations/${categoryName}/introVideo`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		const data = response.data;

		return data;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}
async function manageDeleteIntroVideo(event) {
	const deleteBtn = event.target;
	const introVideoBox = formationInfoContainer.querySelector("video");

	const controlContainer = deleteBtn.parentElement;

	try {
		let response = await deleteIntroVideoResponse(controlContainer.getAttribute("categoryName"));
		deleteBtn.remove();
		const editBtn = controlContainer.querySelector("button.edit");

		switchBtnHandler(editBtn, "add", "ajouter une vidéo d'introduction", "manageAddIntroVideo(event)");
		introVideoBox.setAttribute("src", "");
		introVideoBox.classList.add(hiddenIntroVideoClass);
		controlContainer.classList.add("addVideoStat");

		await alertHint(response.message, "success");
	} catch (error) {
		await alertHint(error.message, error.type);
	}
}

function updateVideoFileBackground(event) {
	const fileInput = event.target;
	const imgContainer = fileInput.closest(".imgContainer");
	const imgContainerContent = imgContainer.querySelector(".content");
	const introVideoWidth = imgContainer.clientWidth;
	const introVideoHeight = imgContainer.clientHeight;
	const saveEditBtn = formationInfoContainer.querySelector(".controlContainer .save");
	if (fileInput.files.length > 0) {
		const reader = new FileReader();

		reader.onload = function (e) {
			imgContainer.innerHTML += `
	  <video src="${e.target.result}" autoplay muted style='width :${introVideoWidth}px; height :${introVideoHeight}px; '></video>
			`;

			const fileInput = event.target;

			saveEditBtn.disabled = false;
			IntroVideoChange = fileInput.files[0];
		};

		reader.readAsDataURL(fileInput.files[0]);
		imgContainerContent.style.display = "none";
	} else {
		imgContainer.style.backgroundImage = `none`;
		imgContainerContent.style.display = "block";
		saveEditBtn.disabled = true;
		IntroVideoChange = "";
	}
}

function manageIntroVideoFileChange(event) {
	updateVideoFileBackground(event);
}
// start formation logic : ----
function getCourseHtmlStructure(course) {
	let adminContent = "";

	if (isLogin()) {
		if (isAdminOrOwner()) {
			adminContent = `
	 						<div class="controlContainer">
							<button class="edit" onclick="manageEditCard(event)">Modifier</button>
							<button class="delete" onclick="manageDeleteCard(event)">Supprimer</button>
						</div>
	 
	 `;
		}
	}

	return `
					<article  categoryName="${course.categoryName}" courseName="${course.courseName}" class="card">
${adminContent}   
                         <div class="imgContainer">
						 <img src="${course.thumbnail}" type="image/webp" alt="${course.courseName} image" />
						
								<div class="beforeContent" categoryName="${course.categoryName}" courseName="${course.courseName}">
                                    <h4 class="beforeContentChild beforeContentCategoryName"> Catégorie : <span>${course.categoryName}</span></h4>
                                    <h4 class="beforeContentChild beforeContentCourseName">  <span> ${course.courseName} </span> </h4>
								</div>
						 </div>
						
						<h3 class="domainName">${course.courseName}</h3>
						<p class="description">${course.description}</p>
					<div class="statistiques">
							<figure class="review">
							
							 ${course.review ? `<img src="imgs/${course.review}_star-removebg-preview.png" alt="like img" />` : `<h5>No review</h5>`}	


									
							</figure>
							<figure class="totalVideosFigure">
								<img src="imgs/videos.png" alt="video img" />
								<h5>${course.numberOfVideos}</h5>
							</figure>
						</div>
						
					</article>

	`;
}

function pushCourseToDom(course, categoryName) {
	course.categoryName = categoryName;
	const htmlStructure = getCourseHtmlStructure(course);

	webContainer.insertAdjacentHTML("beforeend", htmlStructure);
}

async function getFormationResponse(categoryName) {
	try {
		const response = await axios.get(`${baseUrl}/formations/${categoryName}`);

		const data = response.data;

		return data;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}

async function loadFormationInfo(data) {
	const introVideoBox = formationInfoContainer.querySelector("video");
	if (await isAdminOrOwner())
		if (data.introVideo) {
			introVideoContainer.insertAdjacentHTML(
				"afterbegin",
				`
								<div class="controlContainer" categoryName=${data.categoryName}>
							<button class="edit" onclick=manageEditIntroVideo(event) >Modifier</button>
							<button class="delete" onclick=manageDeleteIntroVideo(event)>Supprimer</button>
						</div>
			`
			);
		} else {
			introVideoContainer.insertAdjacentHTML(
				"afterbegin",
				`
								<div class="controlContainer addVideoStat" categoryName=${data.categoryName}>
							<button class="add" onclick=manageAddIntroVideo(event) >ajouter une vidéo d'introduction</button>
							
						
						</div>
			`
			);
		}

	introVideoBox.src = data.introVideo;

	if (!data.introVideo) introVideoBox.classList.add(hiddenIntroVideoClass);

	categoryNameBox.textContent = data.categoryName;
	categoryDescriptionBox.textContent = data.description;
}
let urlParams = getURLParameters();
async function manageGetFormation() {
	if (!urlParams.hasOwnProperty("categoryName")) goToEspaceFormation();

	webContainer.innerHTML = "";

	try {
		const data = await getFormationResponse(urlParams.categoryName);

		await loadFormationInfo(data);

		data.courses.forEach((course) => {
			pushCourseToDom(course, data.categoryName);
		});
	} catch (error) {
		alertHint(error.message, error.type);
	}
}
async function pushAddDomainCourse() {
	if (isLogin()) {
		if (await isAdminOrOwner()) {
			const addContentHtmlStructure = getDomainContentHtmlStructure();
			document.querySelector(".searchContainer").insertAdjacentHTML("afterend", addContentHtmlStructure);
		}
	}
}

function manageAddCourseDescriptionChange(event) {
	autoResize(event.target);
}
function updateFileBackground(event) {
	const fileInput = event.target;
	const imgContainer = fileInput.closest(".imgContainer");
	const imgContainerContent = imgContainer.querySelector(".content");

	if (fileInput.files.length > 0) {
		const reader = new FileReader();

		reader.onload = function (e) {
			imgContainer.style.backgroundImage = `url(${e.target.result})`;
			saveValuesInfo.imgUrl = e.target.result;
		};

		reader.readAsDataURL(fileInput.files[0]);
		imgContainerContent.style.display = "none";
	} else {
		imgContainer.style.backgroundImage = `none`;
		imgContainerContent.style.display = "block";
	}
}

function manageAddDomain(event) {
	const addBtn = event.target;

	setEnableAddDomainMode();
}

async function addCourseResponse(inputsData, categoryName) {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			throw "Connexion utilisateur invalide";
		}
		const token = localStorage.getItem("userToken");

		// Create a FormData object
		const formData = new FormData();

		formData.append("courseName", inputsData.domainTitle);

		formData.append("description", inputsData.domainDescription);

		// Append only changed fields
		if (inputsData.domainImg) {
			formData.append("thumbnail", inputsData.domainImg);
		}

		const response = await axios.post(`${baseUrl}/formations/${categoryName}/courses`, formData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		const data = response.data;

		return data.courseData;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}

function clearAddPopUpValue() {
	addPopUpNameInput.value = "";
	addPopUpDescriptionInput.value = "";
	addPopUpFileInput.value = "";
}
async function addCourse(event) {
	event.target.disabled = true;

	let urlParams = getURLParameters();
	if (!urlParams.hasOwnProperty("categoryName")) goToEspaceFormation();

	const titleValue = addPopUpNameInput.value;
	const descriptionValue = addPopUpDescriptionInput.value;
	const imgFile = addPopUpFileInput.files;

	if (titleValue == "" || descriptionValue == "") {
		if (titleValue != "" && descriptionValue == "") addPopUpDescriptionInput.focus();
		else addPopUpNameInput.focus();

		await alertHint("Le titre et la description sont obligatoires ", "warning");
	} else {
		let data = {
			domainTitle: titleValue,
			domainDescription: descriptionValue,
		};
		if (imgFile.length >= 1) data.domainImg = imgFile[0];

		try {
			const courseData = await addCourseResponse(data, urlParams.categoryName);

			setDisablePopUpBoxMode();
			pushCourseToDom(courseData, urlParams.categoryName);

			scrollToPositionSmooth(webContainer.scrollHeight + 600);
			clearAddPopUpValue();
		} catch (error) {
			await alertHint(error.message, error.type);
		}
	}

	event.target.disabled = false;
}

function setUpEditCardUi(card) {
	if (card) {
		card.classList.add(editStatClass);
		let imgContainer = card.querySelector(".imgContainer");
		let cardTitleBox = card.querySelector(".domainName");
		let cardDescriptionBox = card.querySelector(".description");

		beforeEditInfo.imgContainerContent = imgContainer.innerHTML;
		imgContainer.innerHTML = `	<div class="content">
										<h4>Choisir un fichier</h4>
										<img  src="imgs/addPost.svg" alt="add-image" />
									</div>
									<input type="file" name="image" accept="image/*" onchange="manageImgFileChange(event)" />`;
		beforeEditInfo.title = cardTitleBox.textContent;
		beforeEditInfo.description = cardDescriptionBox.textContent;

		cardTitleBox.innerHTML = `<input type="text" class="domainNameInput" placeholder="Le nom de Mooc"   value="${beforeEditInfo.title}" onInput="manageDomainNameChange(event)">`;
		cardDescriptionBox.innerHTML = `<textarea class="descriptionInput" placeholder="La description de Mooc" oninput="manageDescriptionChange(event)" >${beforeEditInfo.description}</textarea>`;

		autoResize(document.querySelector(".card .descriptionInput"));
	}
}
function clearEditInfo() {
	beforeEditInfo.imgContainerContent = "";
	beforeEditInfo.title = "";
	beforeEditInfo.description = "";

	cardChangedFiledInfo.domainImg = false;
	cardChangedFiledInfo.domainTitle = false;
	cardChangedFiledInfo.domainDescription = false;

	saveValuesInfo.domainImg = "";
	saveValuesInfo.domainTitle = "";
	saveValuesInfo.domainDescription = "";
	saveValuesInfo.imgUrl = "";
}
function setOffEditCardUi(card) {
	if (card) {
		card.classList.remove(editStatClass);
		let imgContainer = card.querySelector(".imgContainer");
		let cardTitleBox = card.querySelector(".domainName");
		let cardDescriptionBox = card.querySelector(".description");

		imgContainer.innerHTML = beforeEditInfo.imgContainerContent;

		let beforeContent = imgContainer.querySelector(".beforeContent");
		let beforeContentText = beforeContent.querySelector(".beforeContentCourseName");

		card.setAttribute("courseName", beforeEditInfo.title);
		beforeContent.setAttribute("courseName", beforeEditInfo.title);
		beforeContentText.textContent = beforeEditInfo.title;

		imgContainer.style.backgroundImage = "unset";
		cardTitleBox.textContent = beforeEditInfo.title;

		cardDescriptionBox.textContent = beforeEditInfo.description;

		if (cardChangedFiledInfo.domainImg && saveValuesInfo.imgUrl) {
			let thumbnailImg = imgContainer.querySelector("img");
			thumbnailImg.setAttribute("src", saveValuesInfo.imgUrl);
		}

		clearEditInfo();
	}
}
function setOffEditedCardBoxes() {
	let editStatCards = document.querySelectorAll(`.card.${editStatClass}`);
	editStatCards.forEach((card) => {
		card.querySelector("button.cancel").click();
	});
}

async function manageEditCard(event) {
	setOffEditedCardBoxes();
	const editBtn = event.target;
	const targetCard = editBtn.parentElement.parentElement;

	switchBtnHandler(editBtn, "cancel", "Annuler", "cancelEditCard(event)");
	const deleteBtn = targetCard.querySelector("button.delete");
	switchBtnHandler(deleteBtn, "save", "Enregistrer", "manageSaveEditCard(event)");
	deleteBtn.disabled = true;

	setUpEditCardUi(targetCard);
}
function cancelEditCard(event) {
	const cancelBtn = event.target;
	const targetCard = cancelBtn.parentElement.parentElement;

	switchBtnHandler(cancelBtn, "edit", "Modifier", "manageEditCard(event)");
	const saveEditBtn = targetCard.querySelector("button.save");
	saveEditBtn.disabled = false;

	setOffEditCardUi(targetCard);

	switchBtnHandler(saveEditBtn, "delete", "Supprimer", "manageDeleteCard(event)");
}

function isChangeDomainTitle(newTitle) {
	return beforeEditInfo.title != newTitle;
}

function isChangeDomainDescription(newDescription) {
	return beforeEditInfo.description != newDescription;
}

function manageDomainNameChange(event) {
	saveValuesInfo.domainTitle = event.target.value.trim().toLowerCase();
	if (isChangeDomainTitle(saveValuesInfo.domainTitle)) cardChangedFiledInfo.domainTitle = true;
	else cardChangedFiledInfo.domainTitle = false;
	handelDeleteCardStat(event);
}
function manageDescriptionChange(event) {
	saveValuesInfo.domainDescription = event.target.value.trim();
	if (isChangeDomainDescription(saveValuesInfo.domainDescription)) cardChangedFiledInfo.domainDescription = true;
	else cardChangedFiledInfo.domainDescription = false;
	handelDeleteCardStat(event);
}

function manageImgFileChange(event) {
	updateFileBackground(event);
	const fileInput = event.target;
	if (fileInput.files.length > 0) {
		cardChangedFiledInfo.domainImg = true;
		saveValuesInfo.domainImg = fileInput.files[0];
	} else {
		cardChangedFiledInfo.domainImg = false;
		saveValuesInfo.domainImg = "";
		saveValuesInfo.imgUrl = "";
	}
	handelDeleteCardStat(event);
}

function isAllowToSave() {
	return cardChangedFiledInfo.domainTitle || cardChangedFiledInfo.domainDescription || cardChangedFiledInfo.domainImg;
}

async function editCourseResponse(courseName) {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			throw "Connexion utilisateur invalide";
		}
		const token = localStorage.getItem("userToken");

		// Create a FormData object
		const formData = new FormData();

		if (cardChangedFiledInfo.domainImg) {
			formData.append("thumbnail", saveValuesInfo.domainImg);
		}
		if (cardChangedFiledInfo.domainTitle) {
			formData.append("courseName", saveValuesInfo.domainTitle);
		}
		if (cardChangedFiledInfo.domainDescription) {
			console.log(saveValuesInfo);
			formData.append("description", saveValuesInfo.domainDescription);
		}
		console.log(courseName);

		const response = await axios.put(`${baseUrl}/formations/${urlParams.categoryName}/courses/${courseName}`, formData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		const data = response.data;

		return data;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}

function updateBeforeTextContent() {
	if (saveValuesInfo.domainTitle) beforeEditInfo.title = saveValuesInfo.domainTitle;
	if (saveValuesInfo.domainDescription) beforeEditInfo.description = saveValuesInfo.domainDescription;
}
async function manageSaveEditCard(event) {
	const saveEditBtn = event.target;
	saveEditBtn.disabled = true;
	if (!isAllowToSave()) return;
	const card = event.target.closest(".card");

	try {
		let courseName = "";
		if (card) courseName = card.getAttribute("courseName");
		data = await editCourseResponse(courseName);

		const cancelBtn = card.querySelector("button.cancel");

		switchBtnHandler(saveEditBtn, "delete", "Delete", "manageDeleteCard(event)");
		switchBtnHandler(cancelBtn, "edit", "Edit", "manageEditCard(event)");
		if (isChangeDomainDescription() || isChangeDomainTitle()) updateBeforeTextContent();

		setOffEditCardUi(card, data.thumbnail);

		alertHint(data.message, "success");
	} catch (error) {
		console.log(error);
		alertHint(error.message, error.type);
	}
	saveEditBtn.disabled = false;
}

function handelDeleteCardStat(event) {
	const saveBtn = event.target.closest(".card").querySelector("button.save");
	if (isAllowToSave()) {
		saveBtn.disabled = false;
	} else {
		saveBtn.disabled = true;
	}
}

function setUpDeleteBoxToShow(domainName, courseName) {
	deletePopUpBox.setAttribute("categoryName", domainName);
	if (courseName) deletePopUpBox.setAttribute("courseName", courseName);
	deleteDomainNameBox.textContent = courseName;
}

async function manageDeleteCard(event) {
	deleteBtn = event.target;
	const targetCard = deleteBtn.parentElement.parentElement;
	const courseName = targetCard.getAttribute("courseName");

	setEnableDeleteMode(targetCard);
	setUpDeleteBoxToShow(urlParams.categoryName, courseName);
}

async function deleteCourseResponse(courseName) {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			throw "Invalid User login";
		}
		const token = localStorage.getItem("userToken");

		const response = await axios.delete(`${baseUrl}/formations/${urlParams.categoryName}/courses/${courseName}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = response.data;

		return data.message;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "Une erreur inattendue s'est produite", type: "danger" };
		}
	}
}

deletePopUpBtn.addEventListener("click", async function () {
	let courseName = deletePopUpBox.getAttribute("courseName");
	try {
		if (courseName) {
			let message = await deleteCourseResponse(courseName);
			let targetCard = webContainer.querySelector(".card.deleteStatus");
			targetCard.remove();
			setDisablePopUpBoxMode();
			await alertHint(message, "success");
		}
	} catch (error) {
		setDisablePopUpBoxMode();
		alertHint(error.message, error.type);
	}
});

window.addEventListener("load", async function () {
	try {
		await manageGetFormation();

		await pushAddDomainCourse();
	} catch (error) {
		alertHint(error.message, error.type);
	}
});
document.addEventListener("click", function (event) {
	if (event.target.classList.contains("beforeContent") || event.target.classList.contains("beforeContentChild")) {
		let targetCard = event.target.closest(".card");

		const categoryName = targetCard.getAttribute("categoryName");
		const courseName = targetCard.getAttribute("courseName");

		if (isLogin()) window.location = `course.html?categoryName=${categoryName}&courseName=${courseName}`;
		else goToLoginPage();
	}
});
