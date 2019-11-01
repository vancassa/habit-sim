(function() {
    var habit = {
        $week: document.querySelector(".week"),
        allData: [],
        currentData: {},
        start: function() {
            habit.loadData(function(data) {
                habit.allData = data;
                habit.currentData = habit.getCurrentWeekData(data);

                habit.eventListeners();
                habit.render(habit.currentData);
            });
        },
        loadData: function(fn) {
            fetch("data.json")
                .then(res => res.json())
                .then(response => fn(response));
        },
        getCurrentWeekData: function(data) {
            let currentWeekData = data[0];
            const today = new Date();

            data.forEach(d => {
                let startDate = new Date(d.startDate),
                    endDate = new Date(d.endDate);

                if (today > startDate && today < endDate) {
                    currentWeekData = d;
                }
            });

            return currentWeekData;
        },
        render: function(weekData) {
            habit.renderNav(weekData.week);
            habit.$week.innerText = `Week ${weekData.week}`;

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

            function createConstantEl() {
                const constantAction = document.createElement('div');
                constantAction.className = 'activity_action_item type--constant';
                const constantActionTitle = document.createElement('span');
                constantActionTitle.classList.add('activity_action_item--title');
                constantActionTitle.innerText = 'Work';
                constantAction.appendChild(constantActionTitle);

                return constantAction;
            }

            // Render activities
            document.querySelectorAll(".activity_action").forEach($el => {
                // Remove existing children
                while ($el.firstChild) {
                    $el.removeChild($el.firstChild);
                }

                // Add new children
                if ($el.id === "saturday" || $el.id === "sunday") {
                    weekData[$el.id].forEach(d => {
                        $el.appendChild(createActionEl(d));
                    });
                } else {
                    $el.appendChild(createConstantEl());
                    $el.appendChild(createActionEl(weekData[$el.id]));
                }
            });
        },
        renderNav: function(week) {
            const $prevBtn = document.querySelector(".footer-nav.type--prev"),
                $nextBtn = document.querySelector(".footer-nav.type--next");

            let showPrevBtn = true, showNextBtn = true;
            
            if (week === habit.allData[0].week) {
                showPrevBtn = false;
                showNextBtn = true;
            } else if (week === habit.allData[habit.allData.length - 1].week) {
                showPrevBtn = true;
                showNextBtn = false;
            }

            $prevBtn.style.visibility = showPrevBtn ? "visible" : "hidden";
            $nextBtn.style.visibility = showNextBtn ? "visible" : "hidden";
        },
        eventListeners: function() {
            // Prev / Next button event listeners
            const $prevBtn = document.querySelector(".footer-nav.type--prev"),
                $nextBtn = document.querySelector(".footer-nav.type--next");

            $prevBtn.addEventListener("mousedown", function() {
                const prevData = habit.allData.filter(d => parseInt(d.week) === parseInt(habit.currentData.week - 1));
                if (prevData.length > 0) {
                    habit.currentData = prevData[0];
                    habit.render(habit.currentData);
                }
            });

            $nextBtn.addEventListener("mousedown", function() {
                const nextData = habit.allData.filter(d => parseInt(d.week) === parseInt(habit.currentData.week) + 1);
                if (nextData.length > 0) {
                    habit.currentData = nextData[0];
                    habit.render(habit.currentData);
                }
            });
        }
    };

    habit.start();
})();
