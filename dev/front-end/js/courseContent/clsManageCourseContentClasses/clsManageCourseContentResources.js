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
		if (resources.length === 0) {
			this.showNoResources();
			return;
		}
		this.manageFillAddBtnToDom();
		this.resourcesContainerDom.innerHTML = resources.map((resource) => this.getResourceCardHtml(resource)).join("");
		console.log(this.noResourcesDom);
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
		if (globalIsAdminOrOwner) console.log(this.addResourceContainerDom);
		this.addResourceContainerDom.innerHTML = `
    
					 <button id="addContentBtn" onclick="courseContentObject.manageCourseContentObject.manageCourseContentResourcesObject.manageShowAddResourcePopUp(event)">Ajouter</button> 
		
    `;
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
	}

	manageShowAddResourcePopUp(event) {
		console.log("add resource ");
		this.popupHandlerObject.setEnableAddResourceMode(event);
	}
	manageShowEditResource(event) {
		console.log("edit resources ");
		this.popupHandlerObject.setEnableEditResourceMode(event);
	}
	manageShowDeleteResource(event) {
		console.log("delete resources : ");
		this.popupHandlerObject.setEnableDeleteResourceMode(event);
	}
	manageEditResourceDescriptionChange(event) {}
}
