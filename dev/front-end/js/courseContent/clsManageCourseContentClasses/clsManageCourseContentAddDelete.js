import clsManageRenderCourseContent from "./clsManageRenderCourseContent.js";
export default class clsManageCourseContentAddDelete {
	static blackDropActiveClass = "activeBlackDrop";
	static ContentPopUpActiveClass = "activePopUp";
	static deleteContentBoxClass = "deleteContentStatus";
	static cancelPopUpClass = "popupButtonCancel";
	constructor(categoryName, courseName, addContentPopUpDom, deleteContentPopUpDom, blackDropDom, addContentPopUpInputsDom, deleteContentPopUpContentNameDom) {
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.addContentPopUpDom = addContentPopUpDom;
		this.deleteContentPopUpDom = deleteContentPopUpDom;
		this.blackDropDom = blackDropDom;
		this.blackDropActiveClass = clsManageCourseContentAddDelete.blackDropActiveClass;
		this.ContentPopUpActiveClass = clsManageCourseContentAddDelete.ContentPopUpActiveClass;
		this.deleteContentBoxClass = clsManageCourseContentAddDelete.deleteContentBoxClass;
		this.cancelPopUpClass = clsManageCourseContentAddDelete.cancelPopUpClass;
		this.addContentPopUpInputsDom = addContentPopUpInputsDom;
		this.deleteContentPopUpContentNameDom = deleteContentPopUpContentNameDom;

	}

	async init() {
		this.addDisablePopUpEvent();
	}

	addDisablePopUpEvent() {
		window.addEventListener("click", (event) => {
			const isCancelBtn = event.target.classList.contains(this.cancelPopUpClass);
			if (event.target == this.blackDropDom || isCancelBtn) {
				this.setDisablePopUpBoxMode(isCancelBtn);
				window.onscroll = function () {};
			}
		});
	}

	setEnableAddContentMode() {
		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.addContentPopUpDom.classList.add(this.ContentPopUpActiveClass);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}

	manageShowAddContentPopUp(event) {
		this.setEnableAddContentMode();
	}
	setDisablePopUpBoxMode(clearInputs = false) {
		if (clearInputs) this.clearAddPopUpInputs();
		this.deleteContentPopUpDom.classList.remove(this.ContentPopUpActiveClass);
		this.addContentPopUpDom.classList.remove(this.ContentPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const contentBox = document.querySelector(`.videosLectureContainer  .contentBox.${this.deleteContentBoxClass}`);
		if (contentBox) contentBox.classList.remove(this.deleteContentBoxClass);
		window.onscroll = function () {};
	}
	#updateVideoFileBackground(event, clearStatus = false) {
		const fileInput = this.addContentPopUpInputsDom.contentPopUpVideoFileInput;

		const imgContainer = fileInput.closest(".imgContainer");

		const imgContainerContent = imgContainer.querySelector(".content");
		const addContentVideoWidth = imgContainer.clientWidth;
		const addContentVideoHeight = imgContainer.clientHeight;

		if (fileInput.files.length > 0 && !clearStatus) {
			const reader = new FileReader();

			reader.onload = function (e) {
				const videoDom = imgContainer.querySelector("video");

				if (videoDom) {
					videoDom.setAttribute("src", `${e.target.result}`);
					videoDom.setAttribute("style", `width :${addContentVideoWidth}px; height :${addContentVideoHeight}px; `);
				} else imgContainer.insertAdjacentHTML("beforeend", `<video src="${e.target.result}" autoplay muted style='width :${addContentVideoWidth}px; height :${addContentVideoHeight}px; '></video>`);
			};

			reader.readAsDataURL(fileInput.files[0]);
			imgContainerContent.style.display = "none";
		} else {
			imgContainer.style.backgroundImage = `none`;
			imgContainerContent.style.display = "block";
		}
	}

	#updateImgFileBackground(event, clearStatus = false) {
		const fileInput = this.addContentPopUpInputsDom.contentPopUpThumbnailFileInput;

		const imgContainer = fileInput.closest(".imgContainer");
		const imgContainerContent = imgContainer.querySelector(".content");

		if (fileInput.files.length > 0 && !clearStatus) {
			const reader = new FileReader();

			reader.onload = function (e) {
				imgContainer.style.backgroundImage = `url(${e.target.result})`;
			};

			reader.readAsDataURL(fileInput.files[0]);
			imgContainerContent.style.display = "none";
		} else {
			imgContainer.style.backgroundImage = `none`;
			imgContainerContent.style.display = "block";
		}
	}
	manageAddContentImgFileChange(event) {
		this.#updateImgFileBackground(event);
	}

	manageAddContentVideoFileChange(event) {
		this.#updateVideoFileBackground(event);
	}
	manageAddContentDescriptionChange(event) {
		autoResize(event.target);
	}

	async addCourseContentResponse(inputsData) {
		try {
			const token = localStorage.getItem("userToken");

			// Create a FormData object
			const formData = new FormData();

			formData.append("title", inputsData.contentTitle);

			formData.append("description", inputsData.contentDescription);
			formData.append("video", inputsData.contentVideo);

			// Append only changed fields
			if (inputsData.contentThumbnail) {
				formData.append("thumbnail", inputsData.contentThumbnail);
			}

			const response = await axios.post(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content`, formData, {
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
	getNewContentBoxHtmlStructure(newCourseContentData) {
		let controlContent = `	<div class="controlContainer">
									<button class="edit" onclick="courseContentObject.manageCourseContentObject.manageCourseContentEventsObject.manageCourseContentEditObject.manageShowEditContentPopUp(event)">Modifier</button>
									<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentEventsObject.manageCourseContentAddDeleteObject.manageShowDeleteContentPopUp(event)">Supprimer</button>
								</div>`;
		return `
          
        <div class="contentBox ">
							<div class="topContent">
								<div class="checkContainer ">
									<i class="fa-solid fa-check"></i>
								</div>
								<h3 class="title">${newCourseContentData.title}</h3>
								<p class="description">${newCourseContentData.description}</p>
							</div>
							<div class="bottomContent">
								<div class="durationContainer">
									<i class="fa-solid fa-video"></i>
									<h5 class="duration">${(newCourseContentData.duration / 60).toFixed(2)} <span>min</span></h5>
								</div>
								${controlContent}
							</div>
						</div>
        `;
	}
	clearAddPopUpInputs() {
		this.addContentPopUpInputsDom.contentPopUpTitleInput.value = "";
		this.addContentPopUpInputsDom.contentPopUpDescriptionInput.value = "";

		this.#updateVideoFileBackground("", true);

		this.#updateImgFileBackground("", true);
	}

	pushNewContentToDom(contentData) {
		const lectureContainerDom = document.querySelector(".videosLectureContainer");
		const newContentHtmlStructure = this.getNewContentBoxHtmlStructure(contentData);
		lectureContainerDom.insertAdjacentHTML("beforeend", newContentHtmlStructure);

		const newContentDom = lectureContainerDom.children[lectureContainerDom.children.length - 1];

		newContentDom.scrollIntoView({
			behavior: "smooth",
		});

		newContentDom.click();
	}
	async manageAddContent(event) {
		const addBtn = event.target;
		addBtn.disabled = true;

		const inputsData = {
			contentTitle: this.addContentPopUpInputsDom.contentPopUpTitleInput.value.trim(),
			contentDescription: this.addContentPopUpInputsDom.contentPopUpDescriptionInput.value.trim(),
			contentVideo: this.addContentPopUpInputsDom.contentPopUpVideoFileInput.files[0],
			contentThumbnail: this.addContentPopUpInputsDom.contentPopUpThumbnailFileInput.files[0],
		};

		if (!inputsData.contentTitle || !inputsData.contentDescription || !inputsData.contentVideo) {
			await alertHint("Please fill in all required fields: Title, Description, and Video.", "warning");
			addBtn.disabled = false;
			return;
		}

		try {
			// Call the method to send the content data
			const data = await this.addCourseContentResponse(inputsData);

			// Handle successful content addition
			alertHint(data.message, "success");
			this.pushNewContentToDom(data.contentDetails);

			this.setDisablePopUpBoxMode();
		} catch (error) {
			// console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			addBtn.disabled = false;
		}
	}

	//  DELETE POPUP LOGIC :
	setEnableDeleteContentMode(event) {
		const deleteBtn = event.target;
		const targetContentBox = deleteBtn.closest("div.contentBox");

		targetContentBox.classList.add(clsManageCourseContentAddDelete.deleteContentBoxClass);

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.deleteContentPopUpDom.classList.add(this.ContentPopUpActiveClass);
		this.deleteContentPopUpContentNameDom.textContent = targetContentBox.querySelector(".topContent .title").textContent;

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}

	manageShowDeleteContentPopUp(event) {
		this.setEnableDeleteContentMode(event);
	}

	async deleteCourseContentResponse(contentTitle) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.delete(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content/${contentTitle}`, {
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

	manageDeleteTargetContentBoxFromUI() {
		const targetBox = document.querySelector(`.videosLectureContainer .${clsManageCourseContentAddDelete.deleteContentBoxClass} `);

		if (targetBox.classList.contains(clsManageRenderCourseContent.currentBoxContentClass)) {
			const leftSide = document.querySelector(".mainContent > .content > .leftSide");
			leftSide.style.visibility = "hidden";
		}

		targetBox.remove();
	}

	async manageDeleteContent(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;

		try {
			const data = await this.deleteCourseContentResponse(this.deleteContentPopUpContentNameDom.textContent);
			this.manageDeleteTargetContentBoxFromUI();
			alertHint(data.message, "success");

			this.setDisablePopUpBoxMode();
		} catch (error) {
			// console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}
}
