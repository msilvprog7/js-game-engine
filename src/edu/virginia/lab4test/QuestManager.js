"use strict";

/**
 * Quest manager
 */
class QuestManager{
	
	constructor() {
		this.quests = [];
	}

	addQuest(questCompleteMessage) {
		// Add quest
		this.quests.push({questCompleteMessage: questCompleteMessage, complete: false});

		// Return id
		return this.quests.length - 1;
	}

	completeQuest(questId) {
		this.quests[questId].complete = true;
		alert(this.quests[questId].questCompleteMessage);
	}

	isActiveQuest(questId) {
		return !this.quests[questId].complete;
	}

}