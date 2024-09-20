import clsManageSideBarAndOptions from "../clsManageSideBarAndOptions.js";
export default class clsManageRenderCourseContent {
	static contentContainerDom = clsManageSideBarAndOptions.rightSideContainerDom.querySelector(".videosLectureContainer");
	static addContentParent = document.getElementById("addContentParent");
	static trackingInfo = "";
	static commentsInfo = [];
	static reviewsInfo = [];
	static review = 0;
	static disableBoxContentClass = "disableBoxContent";
	static currentBoxContentClass = "currentBox";
	static predictedCurrentBoxClass = "predictedCurrentBox";

	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.isAdminOrOwner = false;
		this.activeDescriptionClass = "activeDescription";
	}

	async init() {

		await this.manageRenderCourseContent();
	}

	async getCourseContentResponse() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.get(
				`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}`,

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

	getContentBoxHtmlStructure(courseContentItem, checkedCase, currentBoxCase, disableCase) {
		let controlContent = this.isAdminOrOwner
			? `	<div class="controlContainer">
									<button class="edit" onclick="courseContentObject.manageCourseContentObject.manageCourseContentEventsObject.manageCourseContentEditObject.manageShowEditContentPopUp(event)">Modifier</button>
									<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentEventsObject.manageCourseContentAddDeleteObject.manageShowDeleteContentPopUp(event)">Supprimer</button>
								</div>`
			: "";
		return `
          
        <div class="contentBox ${currentBoxCase ? clsManageRenderCourseContent.predictedCurrentBoxClass : ""} ${disableCase ? clsManageRenderCourseContent.disableBoxContentClass : ""} " data-contentId=${courseContentItem._id}>
							<div class="topContent">
								<div class="checkContainer ${checkedCase ? "checked" : ""}">
									<i class="fa-solid fa-check"></i>
								</div>
								<h3 class="title">${courseContentItem.title}</h3>
								<p class="description">${courseContentItem.description}</p>
							</div>
							<div class="bottomContent">
								<div class="durationContainer">
									<i class="fa-solid fa-video"></i>
									<h5 class="duration">${(courseContentItem.duration / 60).toFixed(2)} <span>min</span></h5>
								</div>
								${controlContent}
							</div>
						</div>
        `;
	}

	manageFillAddBtnToDom() {
		if (this.isAdminOrOwner)
			clsManageRenderCourseContent.addContentParent.innerHTML = `
    	<div class="addContentContainer">
					<button id="addContentBtn" onclick="courseContentObject.manageCourseContentObject.manageCourseContentEventsObject.manageCourseContentAddDeleteObject.manageShowAddContentPopUp(event)">Ajouter</button>
					<div class="addIconContainer">
						<img src="imgs/createIcon.png" alt="create domain img" />
					</div>
				</div>
    `;
	}

	fillCourseContentToDom(courseContent, trackingInfo) {
		let fullContentContainer = "";
		courseContent.forEach((contentItem, index) => {
			const contentItemHtmlStructure = this.getContentBoxHtmlStructure(contentItem, index < trackingInfo.maxContent, index == trackingInfo.currentContent, index > trackingInfo.maxContent);

			fullContentContainer += contentItemHtmlStructure;
		});

		clsManageRenderCourseContent.contentContainerDom.innerHTML = fullContentContainer;
	}

	getCourseDataHtmlStructure(courseData) {
		return `
<h1 class="title">${courseData.courseName}</h1>
								<div class="statistic">
    <div class="review box">
        <h3>${courseData.review ? courseData.review : "Aucun avis"}</h3>
        <img src="imgs/star.png" alt="" />
    </div>
    <div class="box">
        <div class="topContent">
            <i class="fa-regular fa-user"></i>
            <h3><span>${courseData.numberOfUsers}</span> Utilisateur</h3>
        </div>
        <p>Total</p>
    </div>
    <div class="box">
        <div class="topContent">
            <i class="fa-solid fa-thumbs-up"></i>
            <h3><span>${courseData.numberOfLikes}</span> J'aime</h3>
        </div>
        <p>Total</p>
    </div>
    <div class="box">
        <div class="topContent">
            <i class="fa-solid fa-video"></i>
            <h3><span>${courseData.numberOfVideos}</span> Vidéo</h3>
        </div>
        <p>Total</p>
    </div>
</div>
							
`;
	}

	fillCourseDataToDom(courseData) {
		const courseDataHtmlStructure = this.getCourseDataHtmlStructure(courseData);

		const courseDataContainer = document.querySelector(".courseSection .courseInfo");
		const courseDescriptionDom = document.querySelector(".courseSection .courseDescriptionContainer  .description");
		courseDescriptionDom.textContent=courseData.description;

		courseDataContainer.insertAdjacentHTML("afterbegin", courseDataHtmlStructure);
	}

	async manageRenderCourseContent() {
		this.isAdminOrOwner = await isAdminOrOwner();
		this.manageFillAddBtnToDom();
		let { courseDetails: courseData, trackingInfo: trackingInfo } = await this.getCourseContentResponse();
		clsManageRenderCourseContent.trackingInfo = trackingInfo;
		clsManageRenderCourseContent.commentsInfo = courseData.comments;
		clsManageRenderCourseContent.reviewsInfo = courseData.reviews;

		clsManageRenderCourseContent.review = courseData.review;
		

		this.fillCourseContentToDom(courseData.courseContent, trackingInfo);

		this.fillCourseDataToDom(courseData);
	}
}
