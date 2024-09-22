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
	static editQuestionClass = "editQuestionStatus";
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
		try {
			const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.quiz;
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

	static async submitAnswersAPI(categoryName, courseName, answers) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		try {
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
	static async fetchUserFeedbackAPI(categoryName, courseName) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		try {
			const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/feedback`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.feedback;
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

	// Add Quiz
	static async addQuizQuestionAPI(categoryName, courseName, questionData) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		try {
			const response = await axios.post(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question`, questionData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
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

	// Update Quiz
	static async updateQuizQuestionAPI(categoryName, courseName, questionId, questionData) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		try {
			const response = await axios.put(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question/${questionId}`, questionData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
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
	static async getQuizQuestionAPI(categoryName, courseName, questionId) {
		const currentContent = clsUtile.getCurrentContentTitle();
		console.log(currentContent);

		const token = localStorage.getItem("userToken");
		try {
			const response = await axios.get(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question/${questionId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data.question;
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

	// Delete Quiz
	static async deleteQuizQuestionAPI(categoryName, courseName, questionId) {
		const currentContent = clsUtile.getCurrentContentTitle();
		const token = localStorage.getItem("userToken");
		try {
			const response = await axios.delete(`${baseUrl}/formations/${categoryName}/courses/${courseName}/content/${currentContent}/quiz/question/${questionId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
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
								  <i class="fas fa-plus" aria-hidden="true"></i> ajouter une Question
								</button>
     `;
		if (quiz.length === 0) {
			this.showNoQuizAvailable();
			clsQuizDom.submitAnswerContainer.innerHTML = "";
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
        				<button type="submit" class="btn submitQuiz" onclick="courseContentObject.manageCourseContentObject.manageCourseContentQuizObject.manageSubmitQuiz(event)">soumettez vos réponses</button>
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

		this.addQuestionPopUpDom = document.querySelector(".addQuestionPopup");
		this.addPopupQuestionInputDom = this.addQuestionPopUpDom.querySelector("input.questionInput");
		this.addPopUpAnswersListDom = this.addQuestionPopUpDom.querySelector(".answersList");
		this.addPopUpAddAnswerBtn = this.addQuestionPopUpDom.querySelector(".controlContainer button.addAnswerBtn");
		this.addPopUpRemoveAnswerBtn = this.addQuestionPopUpDom.querySelector(".controlContainer button.removeAnswerBtn");

		this.editQuestionPopUpDom = document.querySelector(".editQuestionPopup");
		this.editPopupQuestionInputDom = this.editQuestionPopUpDom.querySelector("input.questionInput");
		this.editPopUpAnswersListDom = this.editQuestionPopUpDom.querySelector(".answersList");
		this.editPopUpAddAnswerBtn = this.editQuestionPopUpDom.querySelector(".controlContainer button.addAnswerBtn");
		this.editPopUpRemoveAnswerBtn = this.editQuestionPopUpDom.querySelector(".controlContainer button.removeAnswerBtn");

		this.blackDropDom = document.querySelector(".blackDrop");
		this.blackDropActiveClass = "activeBlackDrop";
		this.questionPopUpActiveClass = "activePopUp";
		this.cancelPopUpClass = "popupButtonCancel";

		this.init();
	}

	async init() {
		this.addDisablePopUpEvent();
		this.addQuestionPopUpLogic();
		this.editQuestionPopUpLogic();
	}
	addQuestionPopUpLogic() {
		this.addPopUpAddAnswerBtn.addEventListener("click", () => {
			clsAddQuestionHelper.addAnswer(this.addPopUpAnswersListDom);
		});

		this.addPopUpRemoveAnswerBtn.addEventListener("click", () => {
			clsAddQuestionHelper.removeAnswer(this.addPopUpAnswersListDom);
		});
	}
	editQuestionPopUpLogic() {
		this.editPopUpAddAnswerBtn.addEventListener("click", () => {
			clsAddQuestionHelper.addAnswer(this.editPopUpAnswersListDom);
		});

		this.editPopUpRemoveAnswerBtn.addEventListener("click", () => {
			clsAddQuestionHelper.removeAnswer(this.editPopUpAnswersListDom);
		});
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
	resetAddQuestionPopUp() {
		this.addPopUpAnswersListDom.innerHTML = clsAddQuestionHelper.getDefaultAnswersHTML();
		this.addPopupQuestionInputDom.value = "";
	}
	resetEditQuestionPopUp() {
		this.editPopUpAnswersListDom.innerHTML = "";
		this.editPopupQuestionInputDom.value = "";
	}

	setDisablePopUpBoxMode() {
		this.deleteQuestionPopUpDom.classList.remove(this.questionPopUpActiveClass);
		this.blackDropDom.classList.remove(this.blackDropActiveClass);
		const deleteQuestionBox = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.deleteQuestionClass}`);
		if (deleteQuestionBox) deleteQuestionBox.classList.remove(clsQuizDom.deleteQuestionClass);

		this.addQuestionPopUpDom.classList.remove(this.questionPopUpActiveClass);
		this.resetAddQuestionPopUp();

		this.editQuestionPopUpDom.classList.remove(this.questionPopUpActiveClass);
		this.resetEditQuestionPopUp();
		const editQuestionBox = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.editQuestionClass}`);

		if (editQuestionBox) editQuestionBox.classList.remove(clsQuizDom.editQuestionClass);

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

	setEnableAddQuestionMode() {
		this.blackDropDom.classList.add(this.blackDropActiveClass);
		this.addQuestionPopUpDom.classList.add(this.questionPopUpActiveClass);

		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		window.onscroll = function () {
			scrollToPositionHard(scrollTop);
		};
	}

	getToDeleteQuestionId() {
		return this.deleteQuestionPopUpDom.dataset["questionid"];
	}

	populateEditQuestionForm(questionData) {
		this.editPopupQuestionInputDom.value = questionData.question;
		this.editPopUpAnswersListDom.innerHTML = "";
		let answerContent = "";
		questionData.possibleAnswers.forEach((answer) => {
			answerContent += `
			<figure class="answerItem">
                <input type="text" value="${answer.answer}" placeholder="la reponse">
                <select name="answerStatus" class="answerStatus">
                    <option value="1" ${answer.status ? "selected" : ""}>True</option>
                    <option value="0" ${!answer.status ? "selected" : ""}>False</option>
                </select>
			</figure>
            `;
		});

		this.editPopUpAnswersListDom.innerHTML = answerContent;
	}

	async setEnableEditQuestionMode(categoryName, courseName, questionId) {
		try {
			const questionData = await clsQuizApi.getQuizQuestionAPI(categoryName, courseName, questionId);
			console.log(questionData);

			this.populateEditQuestionForm(questionData);

			this.blackDropDom.classList.add(this.blackDropActiveClass);

			this.editQuestionPopUpDom.setAttribute("questionId", questionId);
			this.editQuestionPopUpDom.classList.add(this.questionPopUpActiveClass);

			let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			window.onscroll = function () {
				scrollToPositionHard(scrollTop);
			};
		} catch (error) {
			console.error(error);
			alertHint(error.message, error.type);
		}
	}
}

export class clsManageCourseContentQuiz extends clsManageLoadQuiz {
	constructor(categoryName, courseName) {
		super();
		this.categoryName = categoryName;
		this.courseName = courseName;
		this.manageSubmitQuizObject = new clsManageSubmitQuiz(this.categoryName, this.courseName);
	}
	async init() {
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
		this.popUpHandlerObject.setEnableAddQuestionMode();
	}

	async manageAddQuestion(event) {
		const addBtn = event.target;
		addBtn.disabled = true;

		const question = this.popUpHandlerObject.addPopupQuestionInputDom.value;
		const answersListDom = this.popUpHandlerObject.addPopUpAnswersListDom.querySelectorAll(".answerItem");
		const possibleAnswers = Array.from(answersListDom).map((answerItem) => ({
			answer: answerItem.querySelector("input").value,
			status: Boolean(+answerItem.querySelector("select").value),
		}));
		if (!question) {
			this.popUpHandlerObject.addPopupQuestionInputDom.focus();
			await alertHint("Veuillez fournir une question.", "warning");
			addBtn.disabled = false;
			return;
		}
		const missingAnswerIndex = possibleAnswers.findIndex((answer) => answer.answer == "");
		if (missingAnswerIndex != -1) {
			answersListDom[missingAnswerIndex].querySelector("input").focus();
			await alertHint("Vous devez remplir toutes les entrées de réponse (answersInputs)", "warning");
			addBtn.disabled = false;
			return;
		}
		if (possibleAnswers.length < 2) {
			await alertHint("Vous devez remplir au moins deux entrées de réponse (answersInputs)", "warning");

			this.popUpHandlerObject.addPopUpAddAnswerBtn.click();
			if (possibleAnswers.length == 0) this.popUpHandlerObject.addPopUpAddAnswerBtn.click();

			addBtn.disabled = false;
		}

		try {
			const data = await clsQuizApi.addQuizQuestionAPI(this.categoryName, this.courseName, { question, possibleAnswers });
			clsAddQuestionHelper.pushNewQuestionToDom(data.question);
			this.popUpHandlerObject.setDisablePopUpBoxMode();
			clsQuizDom.noQuizDom.classList.remove(clsQuizDom.activeNoQuizClass);
			alertHint(data.message, "success");
		} catch (error) {
			console.log(error);
			alertHint(error.message, error.type);
		}
		addBtn.disabled = false;
	}

	manageShowEditQuestion(event) {
		event.preventDefault();
		const editBtn = event.target;
		const targetQuestion = editBtn.closest(".questionItem");
		targetQuestion.classList.add(clsQuizDom.editQuestionClass);
		const targetQuestionId = targetQuestion.dataset.questionid;

		this.popUpHandlerObject.setEnableEditQuestionMode(this.categoryName, this.courseName, targetQuestionId);
	}

	async manageEditQuestion(event) {
		const editBtn = event.target;
		editBtn.disabled = true;

		const question = this.popUpHandlerObject.editPopupQuestionInputDom.value;
		const answersListDom = this.popUpHandlerObject.editPopUpAnswersListDom.querySelectorAll(".answerItem");
		const possibleAnswers = Array.from(answersListDom).map((answerItem) => ({
			answer: answerItem.querySelector("input").value,
			status: Boolean(+answerItem.querySelector("select").value),
		}));
		if (!question) {
			this.popUpHandlerObject.editPopupQuestionInputDom.focus();
			await alertHint("Veuillez fournir une question.", "warning");
			editBtn.disabled = false;
			return;
		}
		const missingAnswerIndex = possibleAnswers.findIndex((answer) => answer.answer == "");
		if (missingAnswerIndex != -1) {
			answersListDom[missingAnswerIndex].querySelector("input").focus();
			await alertHint("Vous devez remplir toutes les entrées de réponse (answersInputs)", "warning");
			editBtn.disabled = false;
			return;
		}
		if (possibleAnswers.length < 2) {
			await alertHint("Vous devez remplir au moins deux entrées de réponse (answersInputs)", "warning");

			this.popUpHandlerObject.editPopUpAddAnswerBtn.click();
			if (possibleAnswers.length == 0) this.popUpHandlerObject.editPopUpAddAnswerBtn.click();

			editBtn.disabled = false;
		}

		try {
			const targetQuestionId = this.popUpHandlerObject.editQuestionPopUpDom.getAttribute("questionId");

			console.log(targetQuestionId);

			const data = await clsQuizApi.updateQuizQuestionAPI(this.categoryName, this.courseName, targetQuestionId, { question, possibleAnswers });
			console.log(data);

			clsEditQuestionHelper.UpdatedQuestionINDom({ question, possibleAnswers });
			await alertHint(data.message, "success");
			this.popUpHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			console.log(error);
			alertHint(error.message, error.type);
		}
		editBtn.disabled = false;
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

			if (clsQuizDom.quizContainerDom.querySelectorAll(".questionItem").length == 0) clsQuizDom.noQuizDom.classList.add(clsQuizDom.activeNoQuizClass);

			this.popUpHandlerObject.setDisablePopUpBoxMode();
		} catch (error) {
			console.log(error);
			await alertHint(error.message, error.type);
		} finally {
			deleteBtn.disabled = false;
		}
	}
}

class clsEditQuestionHelper {
	static getUpdatedQuestionContentHtml(question, questionNumber, feedBackContentHtml) {
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
         ${controlContent}
         
				<h4 class="questionText"> <span> ${questionNumber}</span>. ${question.question}</h3>
				<div class="optionsContainer">
					${possibleAnswersHtml}
				</div>
				<div class="feedback" id="feedback_${question._id}">
				${feedBackContentHtml}
				</div>
		`;
	}
	static UpdatedQuestionINDom(questionData) {
		const targetQuestion = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.editQuestionClass}`);
		const targetQuestionNumber = targetQuestion.querySelector(".questionText span").textContent;
		const feedBackContentHtml = targetQuestion.querySelector(".feedback").innerHTML;

		const targetQuestionHtmlContent = this.getUpdatedQuestionContentHtml(questionData, targetQuestionNumber, feedBackContentHtml);
		targetQuestion.innerHTML = targetQuestionHtmlContent;
	}
}

class clsDeleteQuestionHelper {
	static manageDeleteTargetQuestionBoxFromUI() {
		const targetQuizToDelete = clsQuizDom.quizContainerDom.querySelector(` .${clsQuizDom.deleteQuestionClass}`);
		targetQuizToDelete.remove();
	}
}

class clsAddQuestionHelper {
	static getDefaultAnswersHTML() {
		return `
			<figure class="answerItem">
				<input type="text" placeholder="la reponse">
				<select name="answerStatus" class="answerStatus">
					<option value="1">True</option>
					<option value="0">False</option>
				</select>
			</figure>
			<figure class="answerItem">
				<input type="text" placeholder="la reponse">
				<select name="answerStatus" class="answerStatus">
					<option value="1">True</option>
					<option value="0">False</option>
				</select>
			</figure>`;
	}

	static addAnswer(answersListDom) {
		const newAnswer = document.createElement("figure");
		newAnswer.classList.add("answerItem");
		newAnswer.innerHTML = `
			<input type="text" placeholder="la reponse">
			<select name="answerStatus" class="answerStatus">
				<option value="1">True</option>
				<option value="0">False</option>
			</select>
		`;
		answersListDom.appendChild(newAnswer);
	}

	static removeAnswer(answersListDom) {
		const answerItems = answersListDom.querySelectorAll(".answerItem");
		if (answerItems.length > 2) {
			answersListDom.removeChild(answerItems[answerItems.length - 1]);
		}
	}

	static pushNewQuestionToDom(questionData) {
		let quizQuestionsListDom = clsQuizDom.quizContainerDom.querySelectorAll(".questionItem");

		const newQuizIndex = quizQuestionsListDom.length + 1;
		console.log(quizQuestionsListDom);
		console.log(newQuizIndex);
		clsQuizDom.quizContainerDom.innerHTML += clsManageLoadQuiz.getQuestionHtml(questionData, newQuizIndex);

		// Re-select the newly added question after it is appended
		quizQuestionsListDom = clsQuizDom.quizContainerDom.querySelectorAll(".questionItem");

		quizQuestionsListDom[quizQuestionsListDom.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
	}
}
