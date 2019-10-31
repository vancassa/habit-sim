(function() {
    var habit = {
        $week: document.querySelector(".week"),
        allData: [],
        start: function() {
            habit.loadData(function(data) {
                const currentWeekData = habit.getCurrentWeekData(data);
                    
                habit.allData = data;
                habit.render(currentWeekData);
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
        render: function(weekData) {
            const $prevBtn = document.querySelector(".footer-nav.type--prev"),
                $nextBtn = document.querySelector(".footer-nav.type--next");

            $prevBtn.removeEventListener('mousedown', function() {
                const prevData = habit.allData.filter(d => parseInt(d.week) === parseInt(weekData.week - 1));
                if (prevData.length > 0) habit.render(prevData[0]);
            });

            $nextBtn.removeEventListener('mouseDown', function() {
                console.log('next');
                const nextData = habit.allData.filter(d => parseInt(d.week) === parseInt(weekData.week + 1));
                console.log('weekData :', weekData);
                if (nextData.length > 0) habit.render(nextData[0]);
            });

            let showPrevBtn = true, showNextBtn = true;
            if (weekData.week === habit.allData[0].week) {
                showPrevBtn = false;
                showNextBtn = true;
            }
            else if (weekData.week === habit.allData[habit.allData.length-1].week) {
                showPrevBtn = true;
                showNextBtn = false;
            }

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
            
                
            $prevBtn.style.display = showPrevBtn ? 'block' : 'none';
            $nextBtn.style.display = showNextBtn ? 'block' : 'none';

            // Add event listener
            $prevBtn.addEventListener('mousedown', function() {
                const prevData = habit.allData.filter(d => parseInt(d.week) === parseInt(weekData.week - 1));
                if (prevData.length > 0) habit.render(prevData[0]);
            });

            $nextBtn.addEventListener('mousedown', function() {
                console.log('next');
                const nextData = habit.allData.filter(d => parseInt(d.week) === parseInt(weekData.week + 1));
                console.log('weekData :', weekData);
                if (nextData.length > 0) habit.render(nextData[0]);
            });
        }
    };

    habit.start();
})();
