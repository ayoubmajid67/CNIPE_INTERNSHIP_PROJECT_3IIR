export default class clsManageCourseContentEdit {
	static blackDropActiveClass = "activeBlackDrop";
	static ContentPopUpActiveClass = "activePopUp";
	static editContentBoxClass = "editContentStatus";
	static cancelPopUpClass = "popupButtonCancel";

	constructor(categoryName, courseName, editContentPopUpDom, blackDropDom, editContentPopUpInputsDom, currentContentVideoDom) {
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.editContentPopUpDom = editContentPopUpDom;
		this.blackDropDom = blackDropDom;
		this.blackDropActiveClass = clsManageCourseContentEdit.blackDropActiveClass;
		this.ContentPopUpActiveClass = clsManageCourseContentEdit.ContentPopUpActiveClass;
		this.editContentBoxClass = clsManageCourseContentEdit.editContentBoxClass;
		this.cancelPopUpClass = clsManageCourseContentEdit.cancelPopUpClass;
		this.editContentPopUpInputsDom = editContentPopUpInputsDom;
		this.currentContentVideoDom = currentContentVideoDom;
		this.baseEditContentInfo = {
			title: "",
			description: "",
			video: "",
			thumbnail: "",
		};
		this.updateFilesTracker = {
			video: false,
			thumbnail: false,
		};
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

	async getCourseContentItemResponse(title) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.get(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content/${title}`,

				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = response.data;

			return data;
		} catch (error) {
			// Handle error and display message
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}

	async urlToFile(url, filename, mimeType) {
		const response = await fetch(url);
		const blob = await response.blob();
		return new File([blob], filename, { type: mimeType });
	}

	createFileList(files) {
		const dataTransfer = new DataTransfer();
		files.forEach((file) => dataTransfer.items.add(file));
		return dataTransfer.files;
	}
	async updateEditPopupInputs() {
		this.editContentPopUpInputsDom.contentPopUpTitleInput.value = this.baseEditContentInfo.title;
		this.editContentPopUpInputsDom.contentPopUpDescriptionInput.value = this.baseEditContentInfo.description;

		// Convert video URL to a File object and update the video file input
		const videoFile = await this.urlToFile(this.baseEditContentInfo.video, "video.mp4", "video/mp4");
		this.editContentPopUpInputsDom.contentPopUpVideoFileInput.files = this.createFileList([videoFile]);

		let firstTimeStatus = true;
		this.#updateVideoFileBackground(firstTimeStatus);

		// Convert thumbnail URL to a File object and update the image file input
		const imgFile = await this.urlToFile(this.baseEditContentInfo.thumbnail, "thumbnail.jpg", "image/*");
		this.editContentPopUpInputsDom.contentPopUpThumbnailFileInput.files = this.createFileList([imgFile]);

		this.#updateImgFileBackground(firstTimeStatus);
	}

	async setEnableEditContentMode(event) {
		const deleteBtn = event.target;
		const targetContentBox = deleteBtn.closest("div.contentBox");

		targetContentBox.classList.add(clsManageCourseContentEdit.editContentBoxClass);

		const courseContent = await this.getCourseContentItemResponse(targetContentBox.querySelector(".topContent .title").textContent);

		this.baseEditContentInfo = {
			title: courseContent.title,
			description: courseContent.description,
			video: courseContent.videoLink,
			thumbnail: courseContent.thumbnail,
		};

		this.updateEditPopupInputs();

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.editContentPopUpDom.classList.add(this.ContentPopUpActiveClass);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}

	manageShowEditContentPopUp(event) {
		this.setEnableEditContentMode(event);
	}
	setDisablePopUpBoxMode() {
		this.editContentPopUpDom.classList.remove(this.ContentPopUpActiveClass);
		this.editContentPopUpDom.classList.remove(this.ContentPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const contentBox = document.querySelector(`.videosLectureContainer  .contentBox.${this.editContentBoxClass}`);
		if (contentBox) contentBox.classList.remove(this.editContentBoxClass);
		window.onscroll = function () {};
	}
	#updateVideoFileBackground(firstTimeStatus = false) {
		const fileInput = this.editContentPopUpInputsDom.contentPopUpVideoFileInput;

		const imgContainer = fileInput.closest(".imgContainer");

		const imgContainerContent = imgContainer.querySelector(".content");
		const addContentVideoWidth = imgContainer.clientWidth;
		const addContentVideoHeight = imgContainer.clientHeight;

		if (fileInput.files.length > 0) {
			const reader = new FileReader();

			reader.onload = (e) => {
				const videoDom = imgContainer.querySelector("video");

				if (videoDom) {
					videoDom.setAttribute("src", `${e.target.result}`);
					videoDom.setAttribute("style", `width :${addContentVideoWidth}px; height :${addContentVideoHeight}px; `);
				} else imgContainer.insertAdjacentHTML("beforeend", `<video src="${e.target.result}" autoplay muted style='width :${addContentVideoWidth}px; height :${addContentVideoHeight}px; '></video>`);
				if (!firstTimeStatus) this.updateFilesTracker.video = true;
				else this.updateFilesTracker.video = false;
			};

			reader.readAsDataURL(fileInput.files[0]);
			imgContainerContent.style.display = "none";
		} else {
			imgContainer.style.backgroundImage = `none`;
			imgContainerContent.style.display = "block";
		}
	}

	#updateImgFileBackground(firstTimeStatus = false) {
		const fileInput = this.editContentPopUpInputsDom.contentPopUpThumbnailFileInput;

		const imgContainer = fileInput.closest(".imgContainer");
		const imgContainerContent = imgContainer.querySelector(".content");

		if (fileInput.files.length > 0) {
			const reader = new FileReader();

			reader.onload = (e) => {
				imgContainer.style.backgroundImage = `url(${e.target.result})`;
				if (!firstTimeStatus) this.updateFilesTracker.thumbnail = true;
				else this.updateFilesTracker.thumbnail = false;
			};

			reader.readAsDataURL(fileInput.files[0]);
			imgContainerContent.style.display = "none";
		} else {
			imgContainer.style.backgroundImage = `none`;
			imgContainerContent.style.display = "block";
		}
	}
	manageEditContentImgFileChange() {
		this.#updateImgFileBackground();
	}

	manageEditContentVideoFileChange() {
		this.#updateVideoFileBackground();
	}
	manageEditContentDescriptionChange(event) {
		autoResize(event.target);
	}

	async editCourseContentResponse(inputsData) {
		try {
			const token = localStorage.getItem("userToken");

			// Create a FormData object
			const formData = new FormData();

			if (inputsData.contentTitle) formData.append("title", inputsData.contentTitle);

			if (inputsData.contentDescription) formData.append("description", inputsData.contentDescription);
			if (inputsData.contentVideo) formData.append("video", inputsData.contentVideo);

			// Append only changed fields
			if (inputsData.contentThumbnail) formData.append("thumbnail", inputsData.contentThumbnail);

			const response = await axios.put(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/content/${this.baseEditContentInfo.title}`, formData, {
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

	clearAddPopUpInputs() {
		this.editContentPopUpInputsDom.contentPopUpTitleInput.value = "";
		this.editContentPopUpInputsDom.contentPopUpDescriptionInput.value = "";

		this.#updateVideoFileBackground("", true);

		this.#updateImgFileBackground("", true);
	}

	pushUpdateToDom(newBoxContent) {
		const editedContentBox = document.querySelector(`.videosLectureContainer  .contentBox.${this.editContentBoxClass}`);
		editedContentBox.querySelector(".topContent .title").textContent = newBoxContent.title;
		editedContentBox.querySelector(".topContent .description").textContent = newBoxContent.description;

		editedContentBox.querySelector(".bottomContent .durationContainer .duration").innerHTML = `${(newBoxContent.duration / 60).toFixed(2)}<span>min</span>`;

		if (editedContentBox.classList.contains("currentBox")) {
			document.querySelector(".overviewSection .descriptionContainer .description").textContent = newBoxContent.description;
			this.currentContentVideoDom.setAttribute("src", newBoxContent.videoLink);
			this.currentContentVideoDom.setAttribute("poster", newBoxContent.thumbnail);
		}

		editedContentBox.classList.remove(this.editContentBoxClass);
	}

	async manageEditContent(event) {
		const addBtn = event.target;
		addBtn.disabled = true;

		const inputsData = {
			contentTitle: this.editContentPopUpInputsDom.contentPopUpTitleInput.value.trim(),
			contentDescription: this.editContentPopUpInputsDom.contentPopUpDescriptionInput.value.trim(),
			contentVideo: this.editContentPopUpInputsDom.contentPopUpVideoFileInput.files[0],
			contentThumbnail: this.editContentPopUpInputsDom.contentPopUpThumbnailFileInput.files[0],
		};

		if (inputsData.contentTitle == this.baseEditContentInfo.title) inputsData.contentTitle = "";
		if (inputsData.contentDescription == this.baseEditContentInfo.description) inputsData.contentDescription = "";
		if (!this.updateFilesTracker.video) inputsData.contentVideo = "";
		if (!this.updateFilesTracker.thumbnail) inputsData.contentThumbnail = "";

		if (!inputsData.contentTitle && !inputsData.contentDescription && !inputsData.contentVideo && !inputsData.contentThumbnail) {
			await alertHint("Please fill at lest one field: Title, Description,Video and Thumbnail.", "warning");
			addBtn.disabled = false;
			return;
		}

		try {
			const data = await this.editCourseContentResponse(inputsData);

			this.pushUpdateToDom(data.courseContent);

			alertHint(data.message, "success");

			this.setDisablePopUpBoxMode();
		} catch (error) {
			// console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			addBtn.disabled = false;
		}
	}
}
