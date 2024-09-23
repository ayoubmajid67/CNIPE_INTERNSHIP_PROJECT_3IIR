import clsManageRenderCourseContent from "./clsManageRenderCourseContent.js";

class clsCourseContentCommentsDom {
	constructor() {
		this.addCommentParentDom = document.querySelector(".commentsSection .addCommentBox");

		this.addCommentInputDom = this.addCommentParentDom?.querySelector("#commentInput");
		this.addCommentBtnDom = this.addCommentParentDom?.querySelector("#addCommentBtn");
		this.commentsBoxesContainerDom = document.querySelector(".commentsSection .commentsContainer");
		this.commentsCounterDom = document.querySelector(".commentsSection .commentCount span");
		this.blackDropDom = document.querySelector(".blackDrop");
		this.deleteCommentPopUpDom = document.querySelector(".deleteCommentPopup");
		this.deleteReplyCommentPopUpDom = document.querySelector(".deleteReplyPopup");
		this.blackDropActiveClass = "activeBlackDrop";
		this.commentPopUpActiveClass = "activePopUp";
		this.deleteCommentBoxClass = "deleteCommentStatus";

		this.cancelPopUpClass = "popupButtonCancel";
		this.editCommentBoxClass = "editCommentStatus";
		this.addReplyCommentPopUpDom = document.querySelector(".addReplyCommentPopup");
		this.addReplyInput = this.addReplyCommentPopUpDom.querySelector("input.replyInput");
	}
}
class clsCourseContentsApi {
	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
	}

	async pullUpCommentApi(commentId, routeCommentId = false) {
		try {
			const token = localStorage.getItem("userToken");

			let pullUpUrl = `${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/pullUp/${commentId}`;
			if (routeCommentId) {
				pullUpUrl = `${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${routeCommentId}/reply/${commentId}/pullUp`;
			}

			const response = await axios.patch(
				pullUpUrl,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
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
	async addCommentApi(commentMessage) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.post(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments`,
				{ message: commentMessage },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = response.data;
			return data;
		} catch (error) {
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}

	async deleteCommentApi(commentId) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.delete(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${commentId}`, {
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

	async deleteReplyCommentApi(commentId, routeCommentId) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.delete(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${routeCommentId}/reply/${commentId}`, {
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

	async updateCommentApi(commentId, message) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.put(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${commentId}`,
				{
					message: message,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
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
				// console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}
	async updateReplyCommentApi(commentId, routeCommentId, message) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.put(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${routeCommentId}/reply/${commentId}`,
				{
					message: message,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
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
				// console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}

	async addReplyCommentApi(commentMessage, routeCommentId) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.post(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/comments/${routeCommentId}/reply`,
				{ message: commentMessage },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = response.data;
			return data;
		} catch (error) {
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				console.log(error);
				throw { message: "Une erreur inattendue s'est produite.", type: "danger" };
			}
		}
	}
}

class clsCommentsUtile {
	static getSpendTime(createdDate) {
		const now = new Date();
		const commentDate = new Date(createdDate);
		const diffTime = Math.abs(now - commentDate);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert to days
		const diffHours = Math.floor(diffTime / (1000 * 60 * 60)); // convert to hours
		const diffMinutes = Math.floor(diffTime / (1000 * 60)); // convert to minutes

		if (diffDays > 365) {
			const years = Math.floor(diffDays / 365);
			return `${years} year${years > 1 ? "s" : ""} ago`;
		} else if (diffDays > 30) {
			const months = Math.floor(diffDays / 30);
			return `${months} month${months > 1 ? "s" : ""} ago`;
		} else if (diffDays > 7) {
			const weeks = Math.floor(diffDays / 7);
			return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
		} else if (diffDays > 0) {
			return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
		} else if (diffHours > 0) {
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		} else if (diffMinutes > 0) {
			return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
		} else {
			return "just now";
		}
	}
	static isOwnerComment(commentUserUsername) {
		return commentUserUsername == getUsername();
	}
	static sortCommentsDataByNbrPullUp(commentsData) {
		// Sort comments array based on 'nbrPullUp'
		commentsData.sort((a, b) => b.nbrPullUp - a.nbrPullUp);

		// For each comment, sort the replyList based on 'nbrPullUp'
		commentsData.forEach((comment) => {
			if (comment.replyList && comment.replyList.length > 0) {
				comment.replyList.sort((a, b) => b.nbrPullUp - a.nbrPullUp);
			}
		});
	}
	static closeDetails(targetBoxReplySection) {
		targetBoxReplySection.removeAttribute("open");
	}
	static openDetails(targetBoxReplySection) {
		targetBoxReplySection.setAttribute("open", "open");
	}
}

class clsManageLoadCommentsDataToDom {
	constructor(commentsData, commentsContainerDom, commentsCounterDom) {
		this.commentsData = commentsData;
		this.commentsContainerDom = commentsContainerDom;
		this.commentsCounterDom = commentsCounterDom;
	}
	getReplyCommentHtmlStructure(commentItemData, routeCommentId) {
		const spendTime = clsCommentsUtile.getSpendTime(commentItemData.createdDate);
		const isOwner = clsCommentsUtile.isOwnerComment(commentItemData.username);

		const controlContent =
			isOwner || globalIsAdminOrOwner
				? `	<div class="controlContainer">
											<button class="edit" onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageEditReplyComment(event)">Modifier</button>
											<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.ShowDeleteReplyCommentPopup(event)">Supprimer</button>
										</div>`
				: "";
		const isPulled = commentItemData.usersPullUpList.find((username) => username == getUsername());

		return `
            <div class="commentBox" data-commentId='${commentItemData._id}' data-routeCommentId=${routeCommentId}>
            ${controlContent}
                <div class="commentHeader">
                    <div class="userIcon">
                        <img src="${commentItemData.userProfile}" alt="User Profile" />
                    </div>
                    <div class="userInfo">
                        <h3 class="username">${commentItemData.username}</h3>
                        <p class="timePosted">${spendTime}</p>
                    </div>
                </div>
                <p class="commentContent">${commentItemData.message}</p>
                <div class="commentActions">
                    <p class="helpfulText">Ce commentaire a-t-il été utile ?</p>
                    ${
											isOwner
												? ""
												: `
                          <button class="pullUpBtn"  onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.managePullUp(event)"  >Remonter</button>
                           <button class="reportBtn">Signaler</button>
                        `
										}
                  
                   
                </div>
                                	<div class="pullUpContainer ${isOwner ? "controlMode" : ""}">
											<h4 class="nrbPullUp">${commentItemData.nbrPullUp}</h4>
										<img  src="imgs/pullUpIcon${isPulled ? "Fill" : ""}.png"  alt="">
										</div>
            </div>
        `;
	}

	getCommentHtmlStructure(commentItemData) {
		const spendTime = clsCommentsUtile.getSpendTime(commentItemData.createdDate);
		const isOwner = clsCommentsUtile.isOwnerComment(commentItemData.username);
		const controlContent =
			isOwner || globalIsAdminOrOwner
				? `	<div class="controlContainer">
											<button class="edit" onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageEditComment(event)">Modifier</button>
											<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.showDeleteCommentPopup(event)">Supprimer</button>
										</div>`
				: "";

		const hasReplies = commentItemData.replyList && commentItemData.replyList.length > 0;

		const isPulled = commentItemData.usersPullUpList.find((username) => username == getUsername());

		// Generate HTML for the replies
		const replyHtml = hasReplies ? commentItemData.replyList.map((reply) => this.getReplyCommentHtmlStructure(reply, commentItemData._id)).join("") : "";

		return `
            <div class="commentBox" data-commentId='${commentItemData._id}'>
            ${controlContent}
                <div class="commentHeader">
                    <div class="userIcon">
                        <img src="${commentItemData.userProfile}" alt="User Profile" />
                    </div>
                    <div class="userInfo">
                        <h3 class="username">${commentItemData.username}</h3>
                        <p class="timePosted">${spendTime}</p>
                    </div>
                </div>
                <p class="commentContent">${commentItemData.message}</p>
                <div class="commentActions">
                    <p class="helpfulText">Ce commentaire a-t-il été utile ?</p>
                    <button class="replyBtn" onclick='courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.showAddReplyCommentPopup(event)'>Répondre</button>
                    ${
											isOwner
												? ""
												: `
                          <button class="pullUpBtn"  onclick="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.managePullUp(event)"  >Remonter</button>
                           <button class="reportBtn">Signaler</button>
                        `
										}
                  
                   
                </div>
                	<div class="pullUpContainer ${isOwner ? "controlMode" : ""}">
											<h4 class="nrbPullUp">${commentItemData.nbrPullUp}</h4>
											<img  src="imgs/pullUpIcon${isPulled ? "Fill" : ""}.png"   alt="">
										</div>
                 ${hasReplies ? `<details class="repliesSection"><summary>Voir les réponses</summary>${replyHtml}</details>` : ``}
            </div>
        `;
	}

	renderComments() {
		this.commentsCounterDom.textContent = this.commentsData.length;
		const commentsHtml = this.commentsData.map((comment) => this.getCommentHtmlStructure(comment)).join(""); 

		this.commentsContainerDom.innerHTML = commentsHtml;
	}
}

class clsPullUp {
	static getPullUpDomInputs(event) {
		const pullUpBtnDom = event.target;
		const targetCommentBox = pullUpBtnDom.closest(".commentBox");
		const commentId = targetCommentBox.dataset["commentid"];
		const routeCommentId = targetCommentBox.dataset["routecommentid"];
		const pullUpImgDom = targetCommentBox.querySelector(".pullUpContainer img");
		const pullUpCounterDom = targetCommentBox.querySelector(".pullUpContainer .nrbPullUp");
		return { pullUpBtnDom, targetCommentBox, commentId, routeCommentId, pullUpImgDom, pullUpCounterDom };
	}
	static updatePullUpUI(pullUpImgDom, pullUpCounterDom, commentData) {
		pullUpImgDom.setAttribute("src", `imgs/pullUpIcon${commentData.pullDownStatus ? "" : "Fill"}.png`);
		pullUpCounterDom.textContent = commentData.nbrPullUp;
	}
}
class clsAddCommentHelper {
	static getNewCommentDomInputs(addCommentBtnDom, addCommentInputDom) {
		const commentMessage = addCommentInputDom.value.trim();
		if (!commentMessage) {
			return false;
		}
		addCommentBtnDom.disabled = true;

		return { commentMessage, addCommentBtnDom, addCommentInputDom };
	}

	static clearCommentInput(addCommentInputDom) {
		addCommentInputDom.value = "";
	}

	static reEnableCommentButton(addCommentBtnDom) {
		addCommentBtnDom.disabled = false;
	}
	static pushCommentToDom(newCommentData, commentsBoxesContainerDom, loadCommentsObject) {
		const newCommentHtml = loadCommentsObject.getCommentHtmlStructure(newCommentData);

		commentsBoxesContainerDom.insertAdjacentHTML("afterbegin", newCommentHtml);
	}
}
class clsAddReplyCommentHelper {
	static pushReplyCommentToDom(newCommentData, targetRouteCommentId, commentsBoxesContainerDom, deleteCommentBoxClass, loadCommentsObject) {
		const targetCommentBoxToReply = commentsBoxesContainerDom.querySelector(`.commentBox.${deleteCommentBoxClass}`);

		const newCommentHtml = loadCommentsObject.getReplyCommentHtmlStructure(newCommentData, targetRouteCommentId);

		let replyContainer = targetCommentBoxToReply.querySelector(".repliesSection");

		if (replyContainer) {
			replyContainer.insertAdjacentHTML("afterbegin", newCommentHtml);
			clsCommentsUtile.openDetails(replyContainer);
		} else {
			let replyContainerContent = `<details class="repliesSection"><summary>Voir les réponses</summary>${newCommentHtml}</details>`;
			targetCommentBoxToReply.insertAdjacentHTML("beforeend", replyContainerContent);
			
			replyContainer = targetCommentBoxToReply.querySelector(".repliesSection");
	
			
			clsCommentsUtile.openDetails(replyContainer);
		}
	}
}

class clsPopUpHandler extends clsCourseContentCommentsDom {
	constructor() {
		super();
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
	setDisablePopUpBoxMode() {
		this.deleteCommentPopUpDom.classList.remove(this.commentPopUpActiveClass);

		this.deleteReplyCommentPopUpDom.classList.remove(this.commentPopUpActiveClass);
		this.addReplyCommentPopUpDom.classList.remove(this.commentPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const commentBox = this.commentsBoxesContainerDom.querySelector(` .${this.deleteCommentBoxClass}`);
		if (commentBox) commentBox.classList.remove(this.deleteCommentBoxClass);
		window.onscroll = function () {};
	}
	setEnableDeleteCommentMode(event) {
		const deleteBtn = event.target;
		const targetCommentBox = deleteBtn.closest(".commentBox");

		targetCommentBox.classList.add(this.deleteCommentBoxClass);
		const replyContainer = targetCommentBox.querySelector(".repliesSection");
		if (replyContainer) clsCommentsUtile.closeDetails(replyContainer);
		const commentId = targetCommentBox.dataset["commentid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.deleteCommentPopUpDom.classList.add(this.commentPopUpActiveClass);
		this.deleteCommentPopUpDom.setAttribute("data-commentId", commentId);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	setEnableDeleteReplyCommentMode(event) {
		const deleteBtn = event.target;
		const targetCommentBox = deleteBtn.closest(".commentBox");

		targetCommentBox.classList.add(this.deleteCommentBoxClass);

		const commentId = targetCommentBox.dataset["commentid"];
		const routeCommentId = targetCommentBox.dataset["routecommentid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.deleteReplyCommentPopUpDom.classList.add(this.commentPopUpActiveClass);
		this.deleteReplyCommentPopUpDom.setAttribute("data-commentId", commentId);
		this.deleteReplyCommentPopUpDom.setAttribute("data-routeCommentId", routeCommentId);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	setEnableAddReplyCommentMode(event) {
		const deleteBtn = event.target;
		const targetCommentBox = deleteBtn.closest(".commentBox");

		targetCommentBox.classList.add(this.deleteCommentBoxClass);
		const replyContainer = targetCommentBox.querySelector(".repliesSection");
		if (replyContainer) clsCommentsUtile.closeDetails(replyContainer);
		const commentId = targetCommentBox.dataset["commentid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.addReplyCommentPopUpDom.classList.add(this.commentPopUpActiveClass);
		this.addReplyCommentPopUpDom.setAttribute("data-commentId", commentId);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}
	getToDeleteCommentId() {
		return this.deleteCommentPopUpDom.dataset["commentid"];
	}
	getToReplyRouteId() {
		return this.addReplyCommentPopUpDom.dataset["commentid"];
	}
	getAddReplyInput() {
		return this.addReplyCommentPopUpDom.querySelector("input.replyInput");
	}
	getToDeleteReplyCommentIds() {
		return { commentId: this.deleteReplyCommentPopUpDom.dataset["commentid"], routeCommentId: this.deleteReplyCommentPopUpDom.dataset["routecommentid"] };
	}
}

class clsDeleteCommentHelper {
	static manageDeleteTargetCommentBoxFromUI(deleteCommentBoxClass, commentsBoxesContainerDom) {
		const targetCommentToDelete = commentsBoxesContainerDom.querySelector(` .${deleteCommentBoxClass}`);
		targetCommentToDelete.remove();
	}
}
class clsEditCommentHelper {
	constructor() {}

	static setOffPreviousEditedCommentsBoxes(editCommentBoxClass, commentsBoxesContainerDom) {
		const previousEditedCommentBox = commentsBoxesContainerDom.querySelectorAll(` .${editCommentBoxClass} button.cancel`).forEach((cancelBtn) => {
			cancelBtn.click();
		});
	}
	static setUpEditCommentUi(targetComment, editCommentBoxClass, previousMessage) {
		targetComment.classList.add(editCommentBoxClass);
		targetComment.querySelector(".commentContent").innerHTML = `<input type="text" class="message" placeholder="message"   value="${previousMessage}" onInput="courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageChangeCommentMsg(event)">`;
		targetComment.querySelector(".commentContent input").focus();
	}
	static setOffEditCommentUi(targetComment, editCommentBoxClass, previousMessage) {
		targetComment.classList.remove(editCommentBoxClass);
		targetComment.querySelector(".commentContent").innerHTML = previousMessage;
	}
}
export class clsManageCourseContentComments extends clsCourseContentsApi {
	constructor(categoryName, courseName) {
		super(categoryName, courseName);
	}
	async init() {
		isAdminOrOwner = await isAdminOrOwner();

		this.commentsDomObject = new clsCourseContentCommentsDom();
		this.commentsData = clsManageRenderCourseContent.commentsInfo || [];
		this.loadCommentsObject = new clsManageLoadCommentsDataToDom(this.commentsData, this.commentsDomObject.commentsBoxesContainerDom, this.commentsDomObject.commentsCounterDom);
		this.manageRenderComments();
		this.popUpHandlerObject = new clsPopUpHandler();
		this.popUpHandlerObject.init();
	}
	manageRenderComments() {
		clsCommentsUtile.sortCommentsDataByNbrPullUp(this.commentsData);
		this.loadCommentsObject.renderComments();
	}
	async managePullUp(event) {
		const { commentId, routeCommentId, pullUpImgDom, pullUpCounterDom } = clsPullUp.getPullUpDomInputs(event);

		try {
			let data = await super.pullUpCommentApi(commentId, routeCommentId);
			clsPullUp.updatePullUpUI(pullUpImgDom, pullUpCounterDom, data.comment);
		} catch (error) {
			console.log(error);
			// alertHint(error.message,error.type);
		}
	}
	async manageAddComment(event) {
		event.preventDefault();
		const { addCommentInputDom, addCommentBtnDom } = this.commentsDomObject;

		// Get the new comment input
		const commentInput = clsAddCommentHelper.getNewCommentDomInputs(addCommentBtnDom, addCommentInputDom);

		if (!commentInput) {
			clsAddCommentHelper.reEnableCommentButton(addCommentBtnDom);
			await alertHint("S'il vous plaît, écrivez un commentaire.", "warning");
			return;
		}

		const { commentMessage } = commentInput;

		try {
			let data = await super.addCommentApi(commentMessage);

			clsAddCommentHelper.pushCommentToDom(data.comment, this.commentsDomObject.commentsBoxesContainerDom, this.loadCommentsObject);

			clsAddCommentHelper.clearCommentInput(addCommentInputDom);
			this.commentsDomObject.commentsCounterDom.textContent = Number(this.commentsDomObject.commentsCounterDom.textContent) + 1;
		} catch (error) {
			console.log(error);
			// alertHint(error.message, error.type);
		} finally {
			// Re-enable the add comment button
			clsAddCommentHelper.reEnableCommentButton(addCommentBtnDom);
		}
	}

	showDeleteCommentPopup(event) {
		this.popUpHandlerObject.setEnableDeleteCommentMode(event);
	}

	async manageDeleteComment(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;
		const deleteCommentId = this.popUpHandlerObject.getToDeleteCommentId();

		try {
			const data = await super.deleteCommentApi(deleteCommentId);
			clsDeleteCommentHelper.manageDeleteTargetCommentBoxFromUI(this.commentsDomObject.deleteCommentBoxClass, this.commentsDomObject.commentsBoxesContainerDom);
			this.commentsDomObject.commentsCounterDom.textContent = Number(this.commentsDomObject.commentsCounterDom.textContent) - 1;
			alertHint(data.message, "success");

			this.popUpHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			// console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}

	ShowDeleteReplyCommentPopup(event) {
		this.popUpHandlerObject.setEnableDeleteReplyCommentMode(event);
	}
	async manageDeleteReplyComment(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;
		const { commentId, routeCommentId } = this.popUpHandlerObject.getToDeleteReplyCommentIds();

		try {
			const data = await super.deleteReplyCommentApi(commentId, routeCommentId);
			clsDeleteCommentHelper.manageDeleteTargetCommentBoxFromUI(this.commentsDomObject.deleteCommentBoxClass, this.commentsDomObject.commentsBoxesContainerDom);
			alertHint(data.message, "success");

			this.popUpHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			// console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}

	async manageEditComment(event) {
		clsEditCommentHelper.setOffPreviousEditedCommentsBoxes(this.commentsDomObject.editCommentBoxClass, this.commentsDomObject.commentsBoxesContainerDom);
		const editBtn = event.target;
		const targetCommentBox = editBtn.closest(".commentBox");
		const commentContentDom = targetCommentBox.querySelector("p.commentContent");
		this.previousMessage = commentContentDom.textContent;
		this.allowToSave = false;

		switchBtnHandler(editBtn, "cancel", "Annuler", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageCancelEditComment(event)");
		const deleteBtn = targetCommentBox.querySelector("button.delete");
		switchBtnHandler(deleteBtn, "save", "Sauvegarder", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageSaveEditComment(event)");
		deleteBtn.disabled = true;
		clsEditCommentHelper.setUpEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
	}
	async manageCancelEditComment(event) {
		const cancelBtn = event.target;
		const targetCommentBox = cancelBtn.closest(".commentBox");
		const saveBtn = targetCommentBox.querySelector("button.save");
		saveBtn.disabled = false;
		switchBtnHandler(cancelBtn, "edit", "Modifier", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageEditComment(event)");
		switchBtnHandler(saveBtn, "delete", "Supprimer", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.showDeleteCommentPopup(event)");

		clsEditCommentHelper.setOffEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
	}
	async manageSaveEditComment(event) {
		const saveEditBtn = event.target;
		saveEditBtn.disabled = true;
		const targetCommentBox = saveEditBtn.closest(".commentBox");
		if (this.allowToSave) {
			const commentId = targetCommentBox.dataset["commentid"];
			const message = targetCommentBox.querySelector(".commentContent input").value.trim();

			try {
				const data = await super.updateCommentApi(commentId, message);

				this.previousMessage = message;
				clsEditCommentHelper.setOffEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
			} catch (error) {
				console.log(error);
				alertHint(error.message, error.type);
			}
			saveEditBtn.disabled = false;
		} else {
			saveEditBtn.disabled = true;
		}
	}

	manageEditReplyComment(event) {
		clsEditCommentHelper.setOffPreviousEditedCommentsBoxes(this.commentsDomObject.editCommentBoxClass, this.commentsDomObject.commentsBoxesContainerDom);
		const editBtn = event.target;
		const targetCommentBox = editBtn.closest(".commentBox");
		const commentContentDom = targetCommentBox.querySelector("p.commentContent");
		this.previousMessage = commentContentDom.textContent;
		this.allowToSave = false;

		switchBtnHandler(editBtn, "cancel", "cancel", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageCancelEditReplyComment(event)");
		const deleteBtn = targetCommentBox.querySelector("button.delete");
		switchBtnHandler(deleteBtn, "save", "save", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageSaveEditReplyComment(event)");
		deleteBtn.disabled = true;
		clsEditCommentHelper.setUpEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
	}
	async manageCancelEditReplyComment(event) {
		const cancelBtn = event.target;
		const targetCommentBox = cancelBtn.closest(".commentBox");
		const saveBtn = targetCommentBox.querySelector("button.save");
		saveBtn.disabled = false;
		switchBtnHandler(cancelBtn, "edit", "Modifier", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.manageEditReplyComment(event)");
		switchBtnHandler(saveBtn, "delete", "Supprimer", "courseContentObject.manageCourseContentObject.manageCourseContentCommentsObject.ShowDeleteReplyCommentPopup(event)");

		clsEditCommentHelper.setOffEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
	}
	async manageSaveEditReplyComment(event) {
		const saveEditBtn = event.target;
		saveEditBtn.disabled = true;
		const targetCommentBox = saveEditBtn.closest(".commentBox");
		if (this.allowToSave) {
			const commentId = targetCommentBox.dataset["commentid"];
			const routeCommentId = targetCommentBox.dataset["routecommentid"];
			const message = targetCommentBox.querySelector(".commentContent input").value.trim();

			try {
				const data = await super.updateReplyCommentApi(commentId, routeCommentId, message);

				this.previousMessage = message;
				clsEditCommentHelper.setOffEditCommentUi(targetCommentBox, this.commentsDomObject.editCommentBoxClass, this.previousMessage);
			} catch (error) {
				alertHint(error.message, error.type);
			}
			saveEditBtn.disabled = false;
		} else {
			saveEditBtn.disabled = true;
		}
	}
	manageChangeCommentMsg(event) {
		const targetCommentBox = event.target.closest(".commentBox");
		const saveBtn = targetCommentBox.querySelector("button.save");

		const inputValue = event.target.value.trim();
		if (inputValue && inputValue != this.previousMessage) {
			this.allowToSave = true;
			saveBtn.disabled = false;
		} else {
			this.allowToSave = false;
			saveBtn.disabled = true;
		}
	}

	showAddReplyCommentPopup(event) {
		this.popUpHandlerObject.setEnableAddReplyCommentMode(event);
	}
	async manageAddReplyComment(event) {
		const addReplyCommentBtn = event.target;
		addReplyCommentBtn.disabled = true;
		const targetRouteCommentId = this.popUpHandlerObject.getToReplyRouteId();
		const replyInput = this.popUpHandlerObject.getAddReplyInput();
		const message = replyInput.value.trim();

		if (!message) {
			await alertHint("S'il vous plaît, écrivez un commentaire.", "warning");
			addReplyCommentBtn.disabled = false;
			return;
		}

		try {
			let data = await super.addReplyCommentApi(message, targetRouteCommentId);

			clsAddReplyCommentHelper.pushReplyCommentToDom(data.comment, targetRouteCommentId, this.commentsDomObject.commentsBoxesContainerDom, this.commentsDomObject.deleteCommentBoxClass, this.loadCommentsObject);

			replyInput.value = "";
			this.popUpHandlerObject.setDisablePopUpBoxMode(event);
		} catch (error) {
			console.log(error);
			// alertHint(error.message, error.type);
		} finally {
			// Re-enable the add comment button
			addReplyCommentBtn.disabled = false;
		}
	}
}
