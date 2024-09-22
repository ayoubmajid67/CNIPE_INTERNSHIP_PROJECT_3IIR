import clsManageRenderCourseContent from "./clsManageRenderCourseContent.js";
import { clsManageLoadResources } from "./clsManageCourseContentResources.js";
import { clsManageLoadQuiz } from "./clsManageCourseContentQuiz.js";
import { clsManageCourseContentQuiz } from "./clsManageCourseContentQuiz.js";
import { clsQuizApi } from "./clsManageCourseContentQuiz.js";
export default class clsManageCourseContentSwitch {
	constructor(categoryName, courseName, currentContentVideoDom, courseContentDescription, leftIconSwitchDom, rightIconSwitchDom) {
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.currentContentVideoDom = currentContentVideoDom;
		this.currentContentDescription = courseContentDescription;
		this.isAdminOrOwner = true;
		this.leftIconSwitchDom = leftIconSwitchDom;
		this.rightIconSwitchDom = rightIconSwitchDom;
		this.currentVideoDuration = 0;
		this.totalVideoDuration = 0;
		this.nextCounter = false;
	}
	async init() {
		this.#addContentBoxesClickEvent();
		this.isAdminOrOwner = await isAdminOrOwner();
		this.#manageAddLeftRightContentClickEvent();
		if (globalIsEnroll) this.#trackVideoDuration();
	}

	#manageAddLeftRightContentClickEvent() {
		this.leftIconSwitchDom.addEventListener("click", (event) => {
			const boxContainer = document.querySelector(".videosLectureContainer");
			const previousCurrentBox = boxContainer.querySelector(".currentBox");
			const previousCurrentBoxIndex = Array.from(boxContainer.children).indexOf(previousCurrentBox);

			if (previousCurrentBoxIndex > 0) {
				const newCurrentBox = boxContainer.children[previousCurrentBoxIndex - 1];
				// Scroll the new current box into view smoothly
				newCurrentBox.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
				newCurrentBox.click();
			}
		});

		this.rightIconSwitchDom.addEventListener("click", (event) => {
			const boxContainer = document.querySelector(".videosLectureContainer");
			const previousCurrentBox = boxContainer.querySelector(".currentBox");
			const previousCurrentBoxIndex = Array.from(boxContainer.children).indexOf(previousCurrentBox);

			if (previousCurrentBoxIndex + 1 < boxContainer.children.length) {
				const newCurrentBox = boxContainer.children[previousCurrentBoxIndex + 1];
				// Scroll the new current box into view smoothly
				newCurrentBox.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
				newCurrentBox.click();
			}
		});
	}

	#addContentBoxesClickEvent() {
		document.addEventListener("click", (event) => {
			if ((event.target.classList.contains("contentBox") || event.target.closest(".contentBox")) && event.target.closest(".videosLectureContainer") && !event.target.parentElement.classList.contains("controlContainer")) {
				this.manageContentBoxClick(event);
			}
		});
	}

	async updateCourseContentTrackingInfoResponse(currentContent, maxContent = -1) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.put(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/tracking`,
				{
					currentContent: currentContent,
					maxContent: maxContent,
					currentDuration: this.currentVideoDuration,
				},
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
				throw { message: "An unexpected error occurred.", type: "danger" };
			}
		}
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
				throw { message: "An unexpected error occurred.", type: "danger" };
			}
		}
	}
	async manageFillContentItem(targetBox, boxContainer, currentDuration) {
		const titleDom = targetBox.querySelector(".title");

		const titleValue = titleDom.textContent;

		try {
			let courseContent = await this.getCourseContentItemResponse(titleValue);

			const previousCurrentBox = boxContainer.querySelector(".currentBox");
			this.currentContentVideoDom.src = courseContent.videoLink;

			this.currentContentVideoDom.setAttribute("poster", courseContent.thumbnail);
			this.currentContentDescription.textContent = courseContent.description;

			if (previousCurrentBox) previousCurrentBox.classList.remove(clsManageRenderCourseContent.currentBoxContentClass);
			else this.currentContentVideoDom.currentTime = currentDuration;
			targetBox.classList.add(clsManageRenderCourseContent.currentBoxContentClass);

			clsManageLoadResources.renderResources(courseContent.resources || []);

			clsManageLoadQuiz.renderQuiz(courseContent.quiz || []);
			const tempManageCourseContentQuizObject = new clsManageCourseContentQuiz(this.categoryName, this.courseName);
			tempManageCourseContentQuizObject.init();
			tempManageCourseContentQuizObject.manageLoadQuizFeedBack();
		} catch (error) {
			console.log(error);
			throw { error };
		}
	}

	async manageContentBoxClick(event) {
		const leftSide = document.querySelector(".mainContent > .content > .leftSide");
		leftSide.style.visibility = "visible";
		const targetBox = event.target.classList.contains("contentBox") ? event.target : event.target.closest(".contentBox");
		const boxContainer = document.querySelector(".videosLectureContainer");

		const currentContent = Array.from(boxContainer.children).indexOf(targetBox);
		const trackingInfo = clsManageRenderCourseContent.trackingInfo;

		// && currentContent != trackingInfo.currentContent

		if (this.isAdminOrOwner || (currentContent <= trackingInfo.maxContent && !targetBox.classList.contains(clsManageRenderCourseContent.currentBoxContentClass))) {
			try {
				const previousCurrentBox = boxContainer.querySelector(".currentBox");

				if (globalIsEnroll && previousCurrentBox) {
					const response = await this.updateCourseContentTrackingInfoResponse(currentContent);
				}

				await this.manageFillContentItem(targetBox, boxContainer, trackingInfo.currentDuration);
			} catch (error) {
				console.log(error);
				await alertHint(error.message, error.type);
			}
		} else {
			if (!targetBox.classList.contains(clsManageRenderCourseContent.currentBoxContentClass)) targetBox.classList.add(clsManageRenderCourseContent.disableBoxContentClass);
		}
	}

	async manageGoToNextContent(isNext) {
		const boxContainer = document.querySelector(".videosLectureContainer");
		const currentBox = boxContainer.querySelector(".currentBox");
		const currentContentIndex = Array.from(boxContainer.children).indexOf(currentBox);

		let previousBoxesChecked = true;
		for (let i = 0; i < currentContentIndex; i++) {
			if (!boxContainer.children[i].querySelector(".topContent >div.checked")) previousBoxesChecked = false;
		}

		isNext = isNext && previousBoxesChecked;
		try {
			const userFeedBack = await clsQuizApi.fetchUserFeedbackAPI(this.categoryName, this.courseName);

			isNext = isNext && Boolean(userFeedBack.isPassed);

			clsManageRenderCourseContent.trackingInfo = await this.updateCourseContentTrackingInfoResponse(currentContentIndex, isNext ? currentContentIndex + 1 : -1);

			if (isNext) {
				currentBox.querySelector(".checkContainer").classList.add("checked");

				if (boxContainer.children.length == currentContentIndex + 1) return;
				const nextCurrentBox = boxContainer.children[currentContentIndex + 1];

				nextCurrentBox.classList.remove(clsManageRenderCourseContent.disableBoxContentClass);
			}
		} catch (error) {
			console.error("Error updating course content tracking:", error.message);
		}
	}
	throttledManageGoToNextContent = asyncThrottle(async (isNext) => {
		await this.manageGoToNextContent(isNext);
	}, 2000);

	#trackVideoDuration() {
		this.currentContentVideoDom.addEventListener("loadedmetadata", () => {
			this.totalVideoDuration = this.currentContentVideoDom.duration;

			const currentVideoTrackNextVideoEventFunction = async () => {
				this.currentVideoDuration = this.currentContentVideoDom.currentTime;

				const isNext = this.totalVideoDuration - this.currentVideoDuration <= 10;
				await this.throttledManageGoToNextContent(isNext, currentVideoTrackNextVideoEventFunction);
			};

			this.currentContentVideoDom.addEventListener("timeupdate", currentVideoTrackNextVideoEventFunction);
		});
	}
}
