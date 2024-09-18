class clsCourse {
	static rightSideContainer = document.querySelector(".introSection > .rightSide");

	static courseContentContainer = document.querySelector(".mainContent .courseContent");

	static courseName = "";
	static categoryName = "";
	static enrolledBtn;
	static goToCourseBtn;

	constructor(categoryName, courseName) {
		clsCourse.categoryName = categoryName;
		clsCourse.courseName = courseName;

		this.init();
	}
	async init() {
		await this.manageGetCourse();
		clsCourse.enrolledBtn = document.getElementById("enrollCourseBtn");
		clsCourse.goToCourseBtn = document.getElementById("goToCourseBtn");

		if (clsCourse.enrolledBtn)
			clsCourse.enrolledBtn.addEventListener("click", () => {
				this.manageEnrollCourse();
			});

		clsCourse.goToCourseBtn.addEventListener("click", () => {
			window.location = `courseContent.html?categoryName=${clsCourse.categoryName}&courseName=${clsCourse.courseName}`;
		});
	}

	async getCourseResponse() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.get(`${baseUrl}/formations/${clsCourse.categoryName}/courses/${clsCourse.courseName}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = response.data;

			return data.courseDetails;
		} catch (error) {
			// Handle error and display message
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				console.log(error);
				throw { message: " Une erreur inattendue s'est produite", type: "danger" };
			}
		}
	}

	async checkIsEnrolledCourseResponse() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.get(`${baseUrl}/formations/${clsCourse.categoryName}/courses/${clsCourse.courseName}/enrolled`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = response.data;

			return data.enrolled;
		} catch (error) {
			// Handle error and display message
			if (error.response && error.response.data && error.response.data.error) {
				throw { message: error.response.data.error, type: "warning" };
			} else {
				console.log(error);
				throw { message: " Une erreur inattendue s'est produite", type: "danger" };
			}
		}
	}

	async getRightContentHtmlStructure(course) {
		let controlSectionContent = `	<button id="enrollCourseBtn">S'inscrire</button>`;
		const adminOwnerStat = await isAdminOrOwner();
		const enrolledCourseStat = await this.checkIsEnrolledCourseResponse();

		if (enrolledCourseStat) controlSectionContent = `<button id="goToCourseBtn">Aller au Mooc</button>`;
		else if (adminOwnerStat) controlSectionContent += f`<button id="goToCourseBtn">Aller au Mooc</button>`;

		return `
        	<div class="thumbnailContainer">
						<img src="${course.thumbnail}" alt="${course.courseName} thumbnail" />
						<span>Aperçu de ce Mooc</span>
					</div>
					<div class="controlSection">
						${controlSectionContent}
					</div>

					<div class="Statistics">
						<div class="reviewBox">
							<h3 class="review"><span>Évaluation</span></h3>
						 ${course.review ? `<img src="imgs/${course.review}_star-removebg-preview.png" alt="" />` : "Not available"}	
						</div>
						<div class="nbrVideosBox">
							<i class="fa-solid fa-video"></i>
							<h3 class="nbrVideos"><span>Vidéos : </span>${course.numberOfVideos}</h3>
						</div>
						<div class="nbrLikesBox">
							<i class="fa-solid fa-thumbs-up"></i>
							<h3 class="nbrLikes"><span>Likes : </span>${course.numberOfLikes}</h3>
						</div>

						<div class="usersBox">
							<i class="fa-regular fa-user"></i>
							<h3 class="users"><span>utilisateurs : </span>${course.numberOfUsers}</h3>
						</div>
					</div>
        `;
	}

	getCourseContentHtmlBoxStructure(content) {
		return `
   <div class="contentBox">
							<div class="leftSide">
								<h2>${content.title}</h2>
								<p>${content.description}</p>
							</div>
							<div class="rightSide">
								<div class="videoContainer">
                                <img src="${content.thumbnail}" alt="${content.title} video from ${clsCourse.courseName} course" />
									<div class="infoContainer durationContainer"> 
                                 <h4>${content.duration}s</h4>
                                 <img src="imgs/clock.png" alt="${content.title} video from ${clsCourse.courseName} course" />
                                    
                                    </div>
                                    	<div class="infoContainer likesContainer"> 
                                 <h4>${content.nbrOfLikes}</h4>
                                 <img src="imgs/likes.png" alt="${content.title} video from ${clsCourse.courseName} course" />
                                    
                                    </div>
									
								</div>
							</div>
						</div>
`;
	}

	getCourseContentHtmlStructure(courseContent) {
		if (courseContent.length == 0) return `No Content`;

		let courseContentHtml = "";

		courseContent.forEach((content) => {
			courseContentHtml += this.getCourseContentHtmlBoxStructure(content);
		});

		return courseContentHtml;
	}

	fillCourseInfo(courseData) {
		document.querySelector(".courseDescription span").innerText = courseData.description;
		document.querySelector(".courseTitle span").innerText = courseData.courseName;
	}

	async manageGetCourse() {
		try {
			const courseData = await this.getCourseResponse();
			this.fillCourseInfo(courseData);

			const rightContentHtml = await this.getRightContentHtmlStructure(courseData);
			clsCourse.rightSideContainer.innerHTML = rightContentHtml;

			let courseContentHtml = this.getCourseContentHtmlStructure(courseData.courseContent);
			clsCourse.courseContentContainer.innerHTML = courseContentHtml;
		} catch (error) {
			alertHint(error.message, error.type);
		}
	}

	async enrollCourseResponse() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.post(
				`${baseUrl}/formations/${clsCourse.categoryName}/courses/${clsCourse.courseName}/enroll`,
				{},
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
				throw { message: " Une erreur inattendue s'est produite", type: "danger" };
			}
		}
	}
	async manageEnrollCourse() {
		try {
			let response = await this.enrollCourseResponse();

			window.location = `courseContent.html?categoryName=${clsCourse.categoryName}&courseName=${clsCourse.courseName}`;
		} catch (error) {
			alertHint(error.message, error.type);
		}
	}
}

window.addEventListener("load", () => {
	if (!isLogin()) goToLoginPage();

	let urlParams = getURLParameters();
	if (!urlParams.hasOwnProperty("categoryName") || !urlParams.hasOwnProperty("courseName")) goToEspaceFormation();
	const courseObject = new clsCourse(urlParams.categoryName, urlParams.courseName);
});
