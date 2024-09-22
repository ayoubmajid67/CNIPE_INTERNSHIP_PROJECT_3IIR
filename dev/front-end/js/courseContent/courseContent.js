import clsManageSideBarAndOptions from "./clsManageSideBarAndOptions.js";
import clsManageCourseContent from "./clsManageCourseContent.js";

class clsManageAccessCourseContent {
	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
	}

	async isEnrolCourseResponse() {
		try {
			const token = localStorage.getItem("userToken");

			const response = await axios.get(`${baseUrl}/formations/${this.categoryName}/courses/${this.courseName}/enrolled`, {
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
	async managePreventAccessCourseContentEnrolled() {
		try {
			globalIsAdminOrOwner = await isAdminOrOwner();
			globalIsEnroll = await this.isEnrolCourseResponse();

			if (!globalIsEnroll && !globalIsAdminOrOwner) {
				await alertHint("Tu dois t'inscrire dans le Mooc avant de consulter le contenu.", "warning");
				window.location = `course.html?categoryName=${this.categoryName}&courseName=${this.courseName}`;
			}
		} catch (error) {
			console.log(error);
			alertHint(error.message, error.type);
		}
	}
}
class clsCourseContent {
	constructor() {
		if (!isLogin()) goToLoginPage();

		this.manageSideBarAndOptionsObject = new clsManageSideBarAndOptions();
		let urlParams = getURLParameters();
		if (!urlParams.hasOwnProperty("categoryName") || !urlParams.hasOwnProperty("courseName")) goToEspaceFormation();
		this.manageAccessCourseContentObject = new clsManageAccessCourseContent(urlParams.categoryName, urlParams.courseName);

		this.manageCourseContentObject = new clsManageCourseContent(urlParams.categoryName, urlParams.courseName);
	}
	async init() {
		await this.manageAccessCourseContentObject.managePreventAccessCourseContentEnrolled();

		await this.manageCourseContentObject.init();
		this.manageSideBarAndOptionsObject.init();
	}
}

window.addEventListener("load", () => {
	courseContentObject = new clsCourseContent();

	courseContentObject.init();
});
