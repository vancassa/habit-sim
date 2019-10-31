(function() {
    var habit = {
        $week: document.querySelector(".week"),
        start: function() {
            habit.loadData(function(data) {
                const currentWeekData = habit.getCurrentWeekData(data);

                let showPrevBtn = true, showNextBtn = true;
                if (currentWeekData.week === data[0].week) {
                    showPrevBtn = false;
                    showNextBtn = true;
                }
                else if (currentWeekData.week === data[data.length-1].week) {
                    showPrevBtn = true;
                    showNextBtn = false;
                }
                    

                habit.render(currentWeekData, showPrevBtn, showNextBtn);
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
            })

            return currentWeekData;
        },
        render: function(weekData, showPrevBtn, showNextBtn) {
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

            // Render activities
            document.querySelectorAll(".activity_action").forEach($el => {
                if ($el.id === "saturday" || $el.id === "sunday") {
                    weekData[$el.id].forEach(d => {
                        $el.appendChild(createActionEl(d));
                    });
                } else {
                    $el.appendChild(createActionEl(weekData[$el.id]));
                }
            });

            // Hide Prev / Next button
            const $prevBtn = document.querySelector(".footer-nav.type--prev"),
                $nextBtn = document.querySelector(".footer-nav.type--next");
                
            $prevBtn.style.display = showPrevBtn ? 'block' : 'none';
            $nextBtn.style.display = showNextBtn ? 'block' : 'none';
        }
    };

    habit.start();
})();
