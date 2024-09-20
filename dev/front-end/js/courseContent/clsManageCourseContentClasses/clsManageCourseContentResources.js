export class clsManageLoadResources {
	// feature user :_----------------------------
	static async loadResources(categoryName, courseName, currentContent) {
		try {
			const resources = await this.fetchResourcesAPI(categoryName, courseName, currentContent);
			this.renderResources(resources);
		} catch (error) {
			console.error("Error loading resources:", error);
			this.showNoResources();
		}
	}
	static async fetchResourcesAPI(categoryName, courseName, currentContent) {
		const token = localStorage.getItem("userToken");
		const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/resources`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data.resources;
	}
	// :_----------------------------

	static resourcesContainerDom = document.querySelector(".resourcesContainer");
	static noResourcesDom = document.querySelector(".noResources");
	static activeNoResourceClass = "activeNoResources";
	static addResourceContainerDom = document.querySelector(".resourcesSection .addResourceContainer");
	static renderResources(resources) {
		this.manageFillAddBtnToDom();
		if (resources.length === 0) {
			this.showNoResources();
			return;
		}

		this.resourcesContainerDom.innerHTML = resources.map((resource) => this.getResourceCardHtml(resource)).join("");
		this.noResourcesDom.classList.remove(this.activeNoResourceClass);
	}

	static showNoResources() {
		this.resourcesContainerDom.innerHTML = "";
		this.noResourcesDom.classList.add(this.activeNoResourceClass);
	}
	static getResourceCardHtml(resource) {
		let controlContent = globalIsAdminOrOwner
			? `	<div class="controlContainer">
									<button class="edit" onclick="courseContentObject.manageCourseContentObject.manageCourseContentResourcesObject.manageShowEditResource(event)">Modifier</button>
									<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentResourcesObject.manageShowDeleteResource(event)">Supprimer</button>
								</div>`
			: "";
		return `
            <div class="resourceCard" data-resourceId=${resource._id}>
            ${controlContent}
             <div class="content">
                <div class="resourceTitle">${resource.title}</div>
                <div class="resourceDescription">${resource.description}</div>
                <a href="${resource.link}" class="resourceLink" target="_blank">Access Resource</a>
            </div>
            </div>
        `;
	}
	static manageFillAddBtnToDom() {
		if (globalIsAdminOrOwner)
			this.addResourceContainerDom.innerHTML = `
    
					 <button id="addContentBtn" onclick="courseContentObject.manageCourseContentObject.manageCourseContentResourcesObject.manageShowAddResourcePopUp(event)">Ajouter</button> 
		
    `;
	}
}
class clsResourcesApi {
	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
	}

	#getCurrentContentTitle() {
		const boxContainer = document.querySelector(".videosLectureContainer");
		return boxContainer.querySelector(".currentBox .topContent .title").textContent;
	}

	async addResourceApi(resourceData) {
		const contentTitle = this.#getCurrentContentTitle();
		console.log(resourceData);
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.post(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content/${contentTitle}/resources`, resourceData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = response.data;

			return data;
		} catch (error) {
			// Handle error and display message
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				// console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}

	async deleteResourceApi(resourceId) {
		const contentTitle = this.#getCurrentContentTitle();

		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.delete(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content/${contentTitle}/resources/${resourceId}`, {
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
				// console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}
}

class clsPopUpHandler {
	constructor(deleteResourceClass, editResourceClass) {
		this.deleteResourcePopUpDom = document.querySelector(".deleteResourcePopup");
		this.deletePopResourceNameDom = this.deleteResourcePopUpDom.querySelector(".description span");

		this.editResourcePopUpDom = document.querySelector(".editResourcePopup");
		this.addResourcePopUpDom = document.querySelector(".addResourcePopup");
		this.blackDropDom = document.querySelector(".blackDrop");
		this.deleteResourceClass = deleteResourceClass;
		this.editResourceClass = editResourceClass;
		this.blackDropActiveClass = "activeBlackDrop";
		this.resourcePopUpActiveClass = "activePopUp";
		this.cancelPopUpClass = "popupButtonCancel";

		this.init();
	}

	async init() {
		this.addDisablePopUpEvent();
	}

	addDisablePopUpEvent() {
		document.addEventListener("click", (event) => {
			const isCancelBtn = event.target.classList.contains(this.cancelPopUpClass);
			if (event.target == this.blackDropDom || isCancelBtn) {
				this.setDisablePopUpBoxMode(isCancelBtn);
				window.onscroll = function () {};
			}
		});
	}
	setDisablePopUpBoxMode() {
		this.deleteResourcePopUpDom.classList.remove(this.resourcePopUpActiveClass);
		this.editResourcePopUpDom.classList.remove(this.resourcePopUpActiveClass);
		this.addResourcePopUpDom.classList.remove(this.resourcePopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const resourceBox = clsManageLoadResources.resourcesContainerDom.querySelector(` .${this.deleteResourceClass}`);
		if (resourceBox) resourceBox.classList.remove(this.deleteResourceClass);
		window.onscroll = function () {};
	}

	setEnableDeleteResourceMode(event) {
		const deleteBtn = event.target;
		const targetResourceBox = deleteBtn.closest(".resourceCard");

		targetResourceBox.classList.add(this.deleteResourceClass);
		const targetResourceTitle = targetResourceBox.querySelector(".resourceTitle").textContent;

		const resourceId = targetResourceBox.dataset["resourceid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.deleteResourcePopUpDom.classList.add(this.resourcePopUpActiveClass);

		this.deleteResourcePopUpDom.setAttribute("data-resourceId", resourceId);
		this.deletePopResourceNameDom.textContent = targetResourceTitle;

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	setEnableAddResourceMode(event) {
		const addBtn = event.target;

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.addResourcePopUpDom.classList.add(this.resourcePopUpActiveClass);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	setEnableEditResourceMode(event) {
		const editBtn = event.target;

		const targetResourceBox = editBtn.closest(".resourceCard");

		targetResourceBox.classList.add(this.editResourceClass);
		const targetResourceTitle = targetResourceBox.querySelector(".resourceTitle").textContent;

		const resourceId = targetResourceBox.dataset["resourceid"];
		this.editResourcePopUpDom.setAttribute("data-resourceId", resourceId);

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.editResourcePopUpDom.classList.add(this.resourcePopUpActiveClass);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	getToDeleteResourceId() {
		return this.deleteResourcePopUpDom.dataset["resourceid"];
	}
}
class clsDeleteResourceHelper {
	static manageDeleteTargetResourceBoxFromUI(deleteResourceBoxClass) {
		const targetResourceToDelete = clsManageLoadResources.resourcesContainerDom.querySelector(` .${deleteResourceBoxClass}`);
		targetResourceToDelete.remove();
	}
}

class clsAddResourceHelper {
	constructor(addResourcePopUpDom) {
		this.addResourceBtn = addResourcePopUpDom.querySelector("button.popupButtonAdd");

		this.titleInput = addResourcePopUpDom.querySelector(".resourceTitleInput");
		this.linkInput = addResourcePopUpDom.querySelector(".resourceLinkInput");
		this.descriptionInput = addResourcePopUpDom.querySelector(".resourceDescriptionInput");
	}
	getInputsValues() {
		return [this.titleInput.value.trim(), this.linkInput.value.trim(), this.descriptionInput.value.trim()];
	}
	focusOnTitle() {
		this.titleInput.focus();
	}

	isAllowToAddResource() {
		return this.titleInput.value.trim() && this.linkInput.value.trim();
	}
	clearInputsValues() {
		this.titleInput.value = "";
		this.linkInput.value = "";
		this.descriptionInput.value = "";
	}

	getJsonBodyDataToApi() {
		const [titleValue, linkValue, descriptionValue] = this.getInputsValues();

		return {
			title: titleValue,
			link: linkValue,
			description: descriptionValue,
		};
	}

	reEnableResourceButton() {
		this.addResourceBtn = false;
	}
	disableResourceButton() {
		this.addResourceBtn = true;
	}
	pushResourceToDom(newCommentData) {
		const newResourceHtml = clsManageLoadResources.getResourceCardHtml(newCommentData);

		clsManageLoadResources.resourcesContainerDom.insertAdjacentHTML("afterbegin", newResourceHtml);
	}
}

export class clsManageCourseContentResources extends clsManageLoadResources {
	constructor(categoryName, courseName) {
		super();
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.deleteResourceClass = "deleteResourceStatus";
		this.editResourceClass = "editResourceStatus";
	}
	async init() {
		this.popupHandlerObject = new clsPopUpHandler(this.deleteResourceClass, this.editResourceClass);
		this.resourcesApiObject = new clsResourcesApi(this.categoryName, this.courseName);
		this.addResourceHelperObject = new clsAddResourceHelper(this.popupHandlerObject.addResourcePopUpDom);
	}

	manageShowAddResourcePopUp(event) {
		this.popupHandlerObject.setEnableAddResourceMode(event);
	}
	async manageAddResource() {
		if (!this.addResourceHelperObject.isAllowToAddResource()) {
			alertHint("Le titre et le lien sont obligatoires.", "warning");
			this.addResourceHelperObject.focusOnTitle();
			return;
		}

		try {
			const response = await this.resourcesApiObject.addResourceApi(this.addResourceHelperObject.getJsonBodyDataToApi());
			console.log(response);

			this.addResourceHelperObject.pushResourceToDom(response.resource);
			this.popupHandlerObject.setDisablePopUpBoxMode();
			alertHint(response.message, "success");
		} catch (error) {
			alertHint(error.message, error.type);
		}
	}
	manageShowEditResource(event) {
		console.log("edit resources ");
		this.popupHandlerObject.setEnableEditResourceMode(event);
	}
	manageShowDeleteResource(event) {
		this.popupHandlerObject.setEnableDeleteResourceMode(event);
	}
	async manageDeleteResource(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;
		const deleteResourceId = this.popupHandlerObject.getToDeleteResourceId();

		try {
			const data = await this.resourcesApiObject.deleteResourceApi(deleteResourceId);

			clsDeleteResourceHelper.manageDeleteTargetResourceBoxFromUI(this.deleteResourceClass);
			alertHint(data.message, "success");

			this.popupHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}

	manageEditResourceDescriptionChange(event) {}
}
