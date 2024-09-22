class clsQuizDom {
	// DOM elements
	static quizContainerDom = document.querySelector(".questionsList");
	static noQuizDom = document.querySelector(".noQuiz");
	static activeNoQuizClass = "activeNoQuiz";
	static quizFinalMarkDom = document.querySelector(".quizHeader .feedbackValue");
	static correctOptionClass = "correctOption";
	static submitAnswerContainer = document.querySelector(".submitAnswerContainer");
	static retryQuizBtnDom = document.getElementById("retryQuizBtn");
	static retryQuizBtnContainerDom = document.querySelector(".retryBtnContainer");
	static quizFormDom = document.getElementById("quizForm");
	static disabledFormClass = "disabledQuizForm";
	static addQuestionContainerDom = document.querySelector(".quizSection .adminControls");
	static deleteQuestionClass = "deleteQuestionStatus";
}
class clsUtile {
	static getCurrentContentTitle() {
		const boxContainer = document.querySelector(".videosLectureContainer");
		const currentContentDom = boxContainer.querySelector(".currentBox .topContent .title");
		return currentContentDom ? currentContentDom.textContent : boxContainer.querySelector(".predictedCurrentBox .topContent .title").textContent;
	}
}
export class clsQuizApi {
	static async fetchQuizAPI(categoryName, courseName) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data.quiz;
	}

	static async submitAnswersAPI(categoryName, courseName, answers) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.post(
			`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/feedback`,

			answers,

			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	}
	static async fetchUserFeedbackAPI(categoryName, courseName) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/feedback`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data.feedback;
	}

	// Add Quiz
	static async addQuizQuestionAPI(categoryName, courseName, questionData) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.post(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question`, questionData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}

	// Update Quiz
	static async updateQuizQuestionAPI(categoryName, courseName, questionId, questionData) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.put(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question/${questionId}`, questionData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}

	// Delete Quiz
	static async deleteQuizQuestionAPI(categoryName, courseName, questionId) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		const response = await axios.delete(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question/${questionId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}
}
export class clsManageLoadQuiz {
	// Load quiz questions from the API
	static async loadQuiz(categoryName, courseName) {
		try {
			const quizData = await clsQuizApi.fetchQuizAPI(categoryName, courseName);
			this.renderQuiz(quizData);
		} catch (error) {
			console.error("Error loading quiz:", error);
			this.showNoQuizAvailable();
		}
	}

	// Render quiz questions
	static renderQuiz(quiz) {
		if (globalIsAdminOrOwner)
			clsQuizDom.addQuestionContainerDom.innerHTML = `
     <button id="addQuestionBtn" class="btn btnPrimary" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageShowAddQuestion(event)">
								  <i class="fas fa-plus" aria-hidden="true"></i> Add Question
								</button>
     `;
		if (quiz.length === 0) {
			this.showNoQuizAvailable();
			return;
		}

		clsQuizDom.quizContainerDom.innerHTML = quiz.map((question, index) => this.getQuestionHtml(question, index + 1)).join("");
		clsQuizDom.noQuizDom.classList.remove(this.activeNoQuizClass);
	}

	// Show message if no quiz is available
	static showNoQuizAvailable() {
		clsQuizDom.quizContainerDom.innerHTML = "";
		clsQuizDom.noQuizDom.classList.add(clsQuizDom.activeNoQuizClass);
	}
	static hideNoQuizAvailable() {
		clsQuizDom.noQuizDom.classList.remove(clsQuizDom.activeNoQuizClass);
	}

	// Generate HTML for each question
	static getQuestionHtml(question, questionNumber) {
		const questionType = question.isMultipleAnswers ? "checkbox" : "radio";

		let possibleAnswersHtml = question.possibleAnswers
			.map(
				(answer, index) => `
			<label class="option">
				<input type="${questionType}" name="question_${question._id}" value="${index}" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageValidateQuizItem(event)"  />
                <h4>${answer.answer}</h4>
			</label>
		`
			)
			.join("");

		let controlContent = globalIsAdminOrOwner
			? `	<div class="controlContainer">
									<button class="edit"  onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageShowEditQuestion(event)">Modifier</button>
									<button class="delete" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageShowDeleteQuestion(event)">Supprimer</button>
								</div>`
			: "";

		return `
			<li class="questionItem" data-questionId=${question._id}>
         ${controlContent}
         
				<h4 class="questionText"> <span> ${questionNumber}</span>. ${question.question}</h3>
				<div class="optionsContainer">
					${possibleAnswersHtml}
				</div>
				<div class="feedback" id="feedback_${question._id}">
					<!-- Feedback message will go here -->
				</div>
			</li>
		`;
	}
}

class clsManageSubmitQuiz {
	constructor(categoryName, courseName) {
		this.categoryName = categoryName;
		this.courseName = courseName;
	}
	removeSubmitButtonFromDom() {
		clsQuizDom.submitAnswerContainer.innerHTML = "";
	}
	addSubmitButtonToDom() {
		clsQuizDom.submitAnswerContainer.innerHTML = `
        				<button type="submit" class="btn submitQuiz" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageSubmitQuiz(event)">Submit Answers</button>
        `;
	}
	restForm() {
		clsQuizDom.quizFormDom.reset();
	}
	unableQuizForm() {
		clsQuizDom.quizFormDom.classList.remove(clsQuizDom.disabledFormClass);
	}
	disabledQuizForm() {
		clsQuizDom.quizFormDom.classList.add(clsQuizDom.disabledFormClass);
	}
	mangeClearSubmitStat() {
		this.restForm();
		this.unableQuizForm();
		this.addSubmitButtonToDom();
		clsQuizDom.quizFinalMarkDom.textContent = "";

		const questionsList = clsQuizDom.quizContainerDom.querySelectorAll(".questionItem");

		questionsList.forEach((questionItem) => {
			const feedbackDom = questionItem.querySelector(".feedback");
			feedbackDom.innerHTML = "";
			this.removeRightOptions(questionItem);
		});
	}
	manageAddSubmitStat() {
		this.removeSubmitButtonFromDom();
		this.enableRetryBtn();
		this.disabledQuizForm();
	}
	// Submit quiz answers
	async submitQuizAnswers() {
		const firstErrorLiDom = this.validateQuizAnswers();
		if (firstErrorLiDom) {
			await alertHint("Please select at least one answer for question", "warning");
			firstErrorLiDom.scrollIntoView({ behavior: "smooth", block: "start" });
			return;
		}

		const answers = this.collectUserAnswers();

		try {
			// Call the API to submit the answers
			const result = await clsQuizApi.submitAnswersAPI(this.categoryName, this.courseName, answers);
			this.handleQuizResults(result);
		} catch (error) {
			console.error("Error submitting quiz answers:", error);
		}
	}
	validateQuizItem(item) {
		const questionId = item.dataset.questionid;

		const selectedOptions = item.querySelectorAll(`input[name="question_${questionId}"]:checked`);
		const feedbackDom = item.querySelector(".feedback");
		if (selectedOptions.length === 0) {
			feedbackDom.innerHTML = this.getFeedBack("Please select at least one answer for question", "error");
		} else {
			feedbackDom.innerHTML = "";
		}
	}
	validateQuizAnswers() {
		const questionItems = clsQuizDom.quizContainerDom.querySelectorAll("li.questionItem");
		let isError = false;
		let firstLiDom = null;
		questionItems.forEach((item) => {
			const questionId = item.dataset.questionid;

			const selectedOptions = item.querySelectorAll(`input[name="question_${questionId}"]:checked`);
			if (selectedOptions.length === 0) {
				const feedbackDom = item.querySelector(`.feedback`);
				if (!isError) firstLiDom = item;
				isError = true;
				feedbackDom.innerHTML = this.getFeedBack("Please select at least one answer for question", "error");
			}
		});

		return firstLiDom;
	}

	getFeedBack(message, type) {
		return `<figure class="messageContainer ${type}">
												<div class="header">
													<i class="fa-solid fa-check"></i>
													<h3 class="title">${type}</h3>
												</div>
											
												<p class="meessageContent">
													${message}
												</p>
											</figure >`;
	}
	loadRightOptions(questionDom, correctAnswersIndexes) {
		const optionsList = questionDom.querySelectorAll(".option");

		correctAnswersIndexes.forEach((correctOptionIndex) => {
			optionsList[correctOptionIndex].classList.add(clsQuizDom.correctOptionClass);
		});
	}
	removeRightOptions(questionDom) {
		const optionsList = questionDom.querySelectorAll(".option");

		optionsList.forEach((optionItem) => {
			optionItem.classList.remove(clsQuizDom.correctOptionClass);
			optionItem.setAttribute("checked", false);
		});
	}
	enableRetryBtn() {
		clsQuizDom.retryQuizBtnContainerDom.innerHTML = `
        <button class="btn btnSecondary " id="retryQuizBtn" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageRetryQuiz(event)" >Retry</button>
        `;
	}
	disableRetryBtn() {
		clsQuizDom.retryQuizBtnContainerDom.innerHTML = "";
	}
	handleQuizResults(results) {
		clsQuizDom.quizFinalMarkDom.textContent = `${results.finalMark}%`;
		results.feedBack.forEach((question) => {
			const feedbackElement = clsQuizDom.quizContainerDom.querySelector(`#feedback_${question.questionId}`);

			if (question.isCorrect) {
				feedbackElement.innerHTML = this.getFeedBack(question.message, "success");
			} else {
				const targetLiDom = feedbackElement.closest(".questionItem");
				this.loadRightOptions(targetLiDom, question.correctAnswersIndexes);

				feedbackElement.innerHTML = this.getFeedBack(question.message, "error");
			}
		});
		this.manageAddSubmitStat();
		clsQuizDom.quizFinalMarkDom.scrollIntoView({ behavior: "smooth", block: "center" });
	}
	// Collect answers from the form
	collectUserAnswers() {
		const answerElements = clsQuizDom.quizContainerDom.querySelectorAll("li.questionItem input[type='radio']:checked,li.questionItem input[type='checkbox']:checked");
		let answers = {};

		answerElements.forEach((element) => {
			const questionId = element.name.split("_")[1];
			if (!answers[questionId]) {
				answers[questionId] = [];
			}
			// 10 :ensures  converting to the decimal system
			answers[questionId].push(parseInt(element.value, 10));
		});

		return answers;
	}
}
class clsPopUpHandler {
	constructor() {
		this.deleteQuestionPopUpDom = document.querySelector(".deleteQuestionPopup");

		this.deletePopQuestionNameDom = this.deleteQuestionPopUpDom.querySelector(".description span");
		this.blackDropDom = document.querySelector(".blackDrop");
		this.blackDropActiveClass = "activeBlackDrop";
		this.questionPopUpActiveClass = "activePopUp";
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
		this.deleteQuestionPopUpDom.classList.remove(this.questionPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const deleteQuestionBox = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.deleteQuestionClass}`);
		if (deleteQuestionBox) deleteQuestionBox.classList.remove(clsQuizDom.deleteQuestionClass);

		window.onscroll = function () {};
	}

	setEnableDeleteQuestionMode(event) {
		const deleteBtn = event.target;
		const targetQuestionBox = deleteBtn.closest(".questionItem");

		targetQuestionBox.classList.add(clsQuizDom.deleteQuestionClass);
		const targetQuestionQuestion = targetQuestionBox.querySelector(".questionText").textContent;

		const questionId = targetQuestionBox.dataset["questionid"];

		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.deleteQuestionPopUpDom.classList.add(this.questionPopUpActiveClass);

		this.deleteQuestionPopUpDom.setAttribute("data-questionId", questionId);
		this.deletePopQuestionNameDom.textContent = targetQuestionQuestion;

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}

	getToDeleteQuestionId() {
		return this.deleteQuestionPopUpDom.dataset["questionid"];
	}
}

export class clsManageCourseContentQuiz extends clsManageLoadQuiz {
	constructor(categoryName, courseName) {
		super();
		this.categoryName = categoryName;
		this.courseName = courseName;
	}
	async init() {
		this.manageSubmitQuizObject = new clsManageSubmitQuiz(this.categoryName, this.courseName);
		this.popUpHandlerObject = new clsPopUpHandler(this.categoryName, this.courseName);
	}

	async manageSubmitQuiz(event) {
		event.preventDefault();
		event.target.disabled = true;

		this.manageSubmitQuizObject.submitQuizAnswers(event);
		event.target.disabled = false;
	}

	manageValidateQuizItem(event) {
		const targetLiDom = event.target.closest("li.questionItem");

		this.manageSubmitQuizObject.validateQuizItem(targetLiDom);
	}
	manageRetryQuiz(event) {
		this.manageSubmitQuizObject.disableRetryBtn();
		this.manageSubmitQuizObject.mangeClearSubmitStat();
	}

	async manageLoadQuizFeedBack() {
		try {
			const userFeedBack = await clsQuizApi.fetchUserFeedbackAPI(this.categoryName, this.courseName);
			if (userFeedBack.isPassed && userFeedBack.feedBack.length > 0) {
				this.manageSubmitQuizObject.handleQuizResults(userFeedBack);
			}
		} catch (error) {
			console.log(error);
			alertHint(error.message, error.type);
		}
	}

	manageShowAddQuestion(event) {
		console.log("add question");
	}

	manageShowEditQuestion(event) {
		event.preventDefault();
		console.log("edit question ");
	}

	// delete question logic :
	manageShowDeleteQuestion(event) {
		event.preventDefault();
		this.popUpHandlerObject.setEnableDeleteQuestionMode(event);
	}
	async manageDeleteQuestion(event) {
		const deleteBtn = event.target;
		deleteBtn.disabled = true;
		const deleteQuestionId = this.popUpHandlerObject.getToDeleteQuestionId();

		try {
			const data = await clsQuizApi.deleteQuizQuestionAPI(this.categoryName, this.courseName, deleteQuestionId);

			clsDeleteQuestionHelper.manageDeleteTargetQuestionBoxFromUI();
			alertHint(data.message, "success");

			this.popUpHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}
}

class clsDeleteQuestionHelper {
	static manageDeleteTargetQuestionBoxFromUI() {
		const targetQuizToDelete = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.deleteQuestionClass}`);
		targetQuizToDelete.remove();
	}
}
