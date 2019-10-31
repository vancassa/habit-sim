(function() {
    var habit = {
        $week: document.querySelector(".week"),
        start: function() {
            habit.loadData(function(data) {
                habit.render(data);
            });
        },
        loadData: function(fn) {
            fetch("data.json")
                .then(res => res.json())
                .then(response => fn(response));
        },
        render: function(data) {
            console.log("data2 :", data);
            habit.$week.innerText = `Week ${data[0].week}`;

            const weekData = data[0];

            function createActionEl({ typeId, title, desc }) {
                // Create action item card
                const action = document.createElement("div");
                action.classList.add("activity_action_item");
                action.style.backgroundImage = `url("images/${typeId}.jpg")`;
                const actionTitle = document.createElement("span");
                actionTitle.classList.add("activity_action_item--title");
                actionTitle.innerText = title;
                const actionDesc = document.createElement("span");
                actionDesc.classList.add("activity_action_item--desc");
                actionDesc.innerText = desc;

                action.appendChild(actionTitle);
                action.appendChild(actionDesc);

                return action;
            }

            document.querySelectorAll(".activity_action").forEach($el => {
                if ($el.id === "saturday" || $el.id === "sunday") {
                    weekData[$el.id].forEach(d => {
                        $el.appendChild(createActionEl(d));
                    });
                } else {
                    $el.appendChild(createActionEl(weekData[$el.id]));
                }
            });
        }
    };

    habit.start();
})();
