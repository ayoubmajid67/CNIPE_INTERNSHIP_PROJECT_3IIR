import clsManageRenderCourseContent from "./clsManageRenderCourseContent.js";

class clsCourseContentReviewsDom {
	constructor() {
		this.addReviewParentDom = document.querySelector(".reviewsSection .addReviewBox");
		this.addReviewInputDom = this.addReviewParentDom?.querySelector("#reviewComment");
		this.addReviewBtnDom = this.addReviewParentDom?.querySelector("#addReviewBtn");
		this.reviewSelectDom = this.addReviewParentDom?.querySelector(".reviewSelect");
		this.reviewsContainerDom = document.querySelector(".reviewsSection .reviewContainer");
		this.reviewsCounterDom = document.querySelector(".reviewsSection .reviewCount span");
		this.blackDropDom = document.querySelector(".blackDrop");
		this.deleteReviewPopUpDom = document.querySelector(".deleteReviewPopup");
		this.blackDropActiveClass = "activeBlackDrop";
		this.reviewPopUpActiveClass = "activePopUp";
		this.deleteReviewBoxClass = "deleteReviewStatus";

		this.cancelPopUpClass = "popupButtonCancel";
	}
}

class clsCourseContentsApi {
	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
	}

	async addReviewApi(reviewMessage, rating) {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.post(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/reviews`,
				{ review: reviewMessage, rating: rating },
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

	async deleteReviewApi() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.delete(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/reviews`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

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

class clsManageLoadReviewsDataToDom {
	constructor(reviewsData, reviewsContainerDom, reviewsCounterDom) {
		this.reviewsData = reviewsData;
		this.reviewsContainerDom = reviewsContainerDom;
		this.reviewsCounterDom = reviewsCounterDom;
	}

	getReviewHtmlStructure(reviewItemData) {
		const isOwner = reviewItemData.username === getUsername();
		const controlContent = isOwner
			? `<div class="controlContainer">
					<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentReviewsObject.showDeleteReviewPopup(event)">Supprimer</button>
				</div>`
			: "";

		return `
            <div class="reviewBox" data-reviewId='${reviewItemData._id}'>
				${controlContent}
                <div class="reviewHeader">
                    <div class="userIcon">
                        <img src="${reviewItemData.userProfile}" alt="User Profile" />
                    </div>
                    <div class="userInfo">
                        <h3 class="username">${reviewItemData.username}</h3>
                        <div class="ratingBox">
                            <img src="imgs/${reviewItemData.rating}_star-removebg-preview.png" alt="${reviewItemData.rating} stars" />
                        </div>
                        <p class="timePosted">${reviewItemData.createdDate}</p>
                    </div>
                </div>
                <p class="reviewContent">${reviewItemData.review}</p>

                	<div class="reviewActions">
											<p class="helpfulText">Cet avis vous a-t-il été utile ?</p>

										</div>
            </div>`;
	}

	renderReviews() {
		this.reviewsCounterDom.textContent = this.reviewsData.length;
		const reviewsHtml = this.reviewsData.map((review) => this.getReviewHtmlStructure(review)).join("");
		this.reviewsContainerDom.innerHTML = reviewsHtml;
	}
}

class clsPopUpHandler extends clsCourseContentReviewsDom {
	constructor() {
		super();
	}
	async init() {
		this.addDisablePopUpEvent();
	}
	addDisablePopUpEvent() {
		window.addEventListener("click", (event) => {
			const isCancelBtn = event.target.classList.contains(this.cancelPopUpClass);
			if (event.target === this.blackDropDom || isCancelBtn) {
				this.setDisablePopUpBoxMode();
			}
		});
	}
	setDisablePopUpBoxMode() {
		this.deleteReviewPopUpDom.classList.remove(this.reviewPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const reviewBox = this.reviewsContainerDom.querySelector(`.${this.deleteReviewBoxClass}`);
		if (reviewBox) reviewBox.classList.remove(this.deleteReviewBoxClass);
	}
	setEnableDeleteReviewMode(event) {
		const deleteBtn = event.target;
		const targetReviewBox = deleteBtn.closest(".reviewBox");

		targetReviewBox.classList.add(this.deleteReviewBoxClass);
		const reviewId = targetReviewBox.dataset["reviewid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);

		this.deleteReviewPopUpDom.classList.add(this.reviewPopUpActiveClass);
		this.deleteReviewPopUpDom.setAttribute("data-reviewId", reviewId);
	}
	getToDeleteReviewId() {
		return this.deleteReviewPopUpDom.dataset["reviewid"];
	}
}
class clsDeleteReviewHelper {
	static manageDeleteTargetReviewBoxFromUI(deleteReviewBoxClass, reviewsContainerDom) {
		const targetReviewToDelete = reviewsContainerDom.querySelector(`.${deleteReviewBoxClass}`);
		targetReviewToDelete.remove();
	}
}

export class clsManageCourseContentFeedback {
	constructor() {
		this.feedbackSection = document.querySelector(".feedBack");
		this.ratingCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
	}

	// Calculate the percentage for each rating (5 stars to 1 star)
	calculateRatingPercentages() {
		this.ratingCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		if (this.totalReviews == 0) {
			return;
		}
		// Count the number of each rating
		this.reviewsData.forEach((reviewItem) => {
			const rating = Math.round(reviewItem.rating);
			this.ratingCount[rating] += 1;
		});

		// Calculate the percentage

		Object.keys(this.ratingCount).forEach((key) => {
			this.ratingCount[key] = (this.ratingCount[key] / this.totalReviews) * 100;
		});
	}

	// Render the feedback section
	renderFeedback() {
		// Set the main course rating

		// Set the average course rating in the feedback section
		this.feedbackSection.querySelector(".rating").textContent = this.rating.toFixed(1);

		this.feedbackSection.querySelector(".ratingTitle").innerHTML = `<span> Évaluation  </span> <span> (${this.totalReviews}) </span>`;

		// Set the star rating image based on the rounded rating

		this.feedbackSection.querySelector(".leftContent img").src = `imgs/${this.rating}_star-removebg-preview.png`;

		// Set the percentage for each star rating
		const rightContent = this.feedbackSection.querySelectorAll(".rightContent .ratingBox");
		const ratingKeys = [5, 4, 3, 2, 1];

		ratingKeys.forEach((key, index) => {
			const percentage = Math.floor(this.ratingCount[key]);
			rightContent[index].querySelector("figure").style.width = `${percentage}%`;
			rightContent[index].querySelector(".fillValue").textContent = `${percentage}%`;
		});
	}

	// Initialize the feedback section with real data
	initFeedback(rating, reviewsData) {
		this.rating = rating;
		this.reviewsData = reviewsData;
		this.totalReviews = this.reviewsData.length;
		this.calculateRatingPercentages();
		this.renderFeedback();
	}
}

export class clsManageCourseContentReviews extends clsCourseContentsApi {
	constructor(categoryName, courseName) {
		super(categoryName, courseName);
	}

	async init() {
		this.reviewsDomObject = new clsCourseContentReviewsDom();

		this.reviewsData = clsManageRenderCourseContent.reviewsInfo || [];
		this.review = clsManageRenderCourseContent.review;

		this.loadReviewsObject = new clsManageLoadReviewsDataToDom(this.reviewsData, this.reviewsDomObject.reviewsContainerDom, this.reviewsDomObject.reviewsCounterDom);

		this.manageRenderReviews();
		this.popUpHandlerObject = new clsPopUpHandler();
		this.popUpHandlerObject.init();

		this.feedbackManager = new clsManageCourseContentFeedback();
		this.feedbackManager.initFeedback(this.review, this.reviewsData);
	}

	manageRenderReviews() {
		this.loadReviewsObject.renderReviews();
	}

	async manageAddReview(event) {
		event.preventDefault();
		const { addReviewInputDom, addReviewBtnDom, reviewSelectDom } = this.reviewsDomObject;

		const reviewMessage = addReviewInputDom.value.trim();
		const rating = parseFloat(reviewSelectDom.value);

		try {
			let data = await super.addReviewApi(reviewMessage, rating);
			this.review = data.averageRating;
			this.reviewsData.push(data.review);
			this.feedbackManager.initFeedback(this.review, this.reviewsData);

			const newReviewHtml = this.loadReviewsObject.getReviewHtmlStructure(data.review);
			addReviewInputDom.value = "";
			this.reviewsDomObject.reviewsContainerDom.insertAdjacentHTML("afterbegin", newReviewHtml);
			this.reviewsDomObject.reviewsCounterDom.textContent = Number(this.reviewsDomObject.reviewsCounterDom.textContent) + 1;
		} catch (error) {
			console.log(error);
			alertHint(error.message, error.type);
		} finally {
			addReviewBtnDom.disabled = false;
		}
	}

	showDeleteReviewPopup(event) {
		this.popUpHandlerObject.setEnableDeleteReviewMode(event);
	}

	async manageDeleteReview(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;
		const deleteReviewId = this.popUpHandlerObject.getToDeleteReviewId();

		try {
			const data = await super.deleteReviewApi();
			this.review = data.averageRating;

			this.reviewsData = this.reviewsData.filter((review) => review._id !== deleteReviewId);

			this.feedbackManager.initFeedback(this.review, this.reviewsData);
			clsDeleteReviewHelper.manageDeleteTargetReviewBoxFromUI(this.reviewsDomObject.deleteReviewBoxClass, this.reviewsDomObject.reviewsContainerDom);
			this.reviewsDomObject.reviewsCounterDom.textContent = Number(this.reviewsDomObject.reviewsCounterDom.textContent) - 1;
			alertHint("Review deleted successfully.", "success");
		} catch (error) {
			console.log(error);
			alert(error.message);
		} finally {
			deleteBtn.disabled = false;
			this.popUpHandlerObject.setDisablePopUpBoxMode();
		}
	}
}
