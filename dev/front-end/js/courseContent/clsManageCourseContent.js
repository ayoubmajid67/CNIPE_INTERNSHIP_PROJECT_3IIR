import clsManageRenderCourseContent from "./clsManageCourseContentClasses/clsManageRenderCourseContent.js";

import clsManageCourseContentSwitch from "./clsManageCourseContentClasses/clsManageCourseContentSwitch.js";

import clsManageCourseContentAddDelete from "./clsManageCourseContentClasses/clsManageCourseContentAddDelete.js";
import clsManageCourseContentEdit from "./clsManageCourseContentClasses/clsManageCourseContentEdit.js";
import { clsManageCourseContentComments } from "./clsManageCourseContentClasses/clsManageCourseContentComments.js";

import { clsManageCourseContentReviews } from "./clsManageCourseContentClasses/clsManageCourseContentReviews.js";

import { clsManageCourseContentResources } from "./clsManageCourseContentClasses/clsManageCourseContentResources.js";
import { clsManageCourseContentQuiz } from "./clsManageCourseContentClasses/clsManageCourseContentQuiz.js";
class clsManageCourseContentEvents {
	static currentContentVideoDom = document.querySelector("#currentVideo");
	static courseContentDescriptionDom = document.querySelector(".overviewSection .currentContentInfo .description");
	static leftIconSwitchDom = document.querySelector(".leftArrow");
	static rightIconSwitchDom = document.querySelector(".rightArrow");
	static addContentPopUpDom = document.querySelector(".addContentPopup");
	static editContentPopUpDom = document.querySelector(".editContentPopup");
	static blackDropDom = document.querySelector(".blackDrop");
	static deleteContentPopUpDom = document.querySelector(".deleteContentPopup");
	static deleteContentPopUpContentNameDom = clsManageCourseContentEvents.deleteContentPopUpDom.querySelector(".popUpContentName");
	static addContentPopUpInputsDom = {
		contentPopUpTitleInput: clsManageCourseContentEvents.addContentPopUpDom.querySelector(".contentTitleInput"),
		contentPopUpDescriptionInput: clsManageCourseContentEvents.addContentPopUpDom.querySelector(".descriptionInput"),
		contentPopUpVideoFileInput: clsManageCourseContentEvents.addContentPopUpDom.querySelector('input[type="file"]#addVideoFile'),
		contentPopUpThumbnailFileInput: clsManageCourseContentEvents.addContentPopUpDom.querySelector('input[type="file"]#addThumbnailFile'),
	};

	static editContentPopUpInputsDom = {
		contentPopUpTitleInput: clsManageCourseContentEvents.editContentPopUpDom.querySelector(".contentTitleInput"),
		contentPopUpDescriptionInput: clsManageCourseContentEvents.editContentPopUpDom.querySelector(".descriptionInput"),
		contentPopUpVideoFileInput: clsManageCourseContentEvents.editContentPopUpDom.querySelector('input[type="file"]#addVideoFile'),
		contentPopUpThumbnailFileInput: clsManageCourseContentEvents.editContentPopUpDom.querySelector('input[type="file"]#addThumbnailFile'),
	};

	constructor(categoryName, courseName) {
		this.manageCourseContentSwitchObject = new clsManageCourseContentSwitch(categoryName, courseName, clsManageCourseContentEvents.currentContentVideoDom, clsManageCourseContentEvents.courseContentDescriptionDom, clsManageCourseContentEvents.leftIconSwitchDom, clsManageCourseContentEvents.rightIconSwitchDom);
		this.manageCourseContentAddDeleteObject = new clsManageCourseContentAddDelete(categoryName, courseName, clsManageCourseContentEvents.addContentPopUpDom, clsManageCourseContentEvents.deleteContentPopUpDom, clsManageCourseContentEvents.blackDropDom, clsManageCourseContentEvents.addContentPopUpInputsDom, clsManageCourseContentEvents.deleteContentPopUpContentNameDom);
		this.manageCourseContentEditObject = new clsManageCourseContentEdit(categoryName, courseName, clsManageCourseContentEvents.editContentPopUpDom, clsManageCourseContentEvents.blackDropDom, clsManageCourseContentEvents.editContentPopUpInputsDom, clsManageCourseContentEvents.currentContentVideoDom);
	}

	async init() {
		await this.manageCourseContentSwitchObject.init();
		this.manageCourseContentAddDeleteObject.init();
		this.manageCourseContentEditObject.init();
	}
}

export default class clsManageCourseContent {
	constructor(categoryName, courseName) {
		this.manageRenderCourseContentObject = new clsManageRenderCourseContent(categoryName, courseName);
		this.manageCourseContentEventsObject = new clsManageCourseContentEvents(categoryName, courseName);
		this.manageCourseContentCommentsObject = new clsManageCourseContentComments(categoryName, courseName);
		this.manageCourseContentReviewsObject = new clsManageCourseContentReviews(categoryName, courseName);
		this.manageCourseContentResourcesObject = new clsManageCourseContentResources(categoryName, courseName);
		this.manageCourseContentQuizObject = new clsManageCourseContentQuiz(categoryName, courseName);
	}

	async init() {
		await this.manageRenderCourseContentObject.init();
		await this.manageCourseContentEventsObject.init();
		await this.manageCourseContentCommentsObject.init();
		await this.manageCourseContentReviewsObject.init();
		await this.manageCourseContentResourcesObject.init();
		await this.manageCourseContentQuizObject.init();
	}
}
