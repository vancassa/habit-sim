(function() {
    var habit = {
        PROGRESS_CONSTANT: 10,
        $week: document.querySelector(".week"),
        $date: document.querySelector(".date"),
        $prevBtn: document.querySelector(".footer-nav.type--prev"),
        $nextBtn: document.querySelector(".footer-nav.type--next"),
        allData: [],
        currentData: {},
        startTouchX: 0,
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
                const startDate = new Date(d.startDate),
                    endDate = new Date(d.endDate);

                if (today > startDate && today < endDate) {
                    currentWeekData = d;
                }
            });

            return currentWeekData;
        },
        render: function(weekData) {
            let goalsJap = 0, goalsFitness = 0, goalsJS = 0;

            habit.renderNav(weekData.week);
            habit.$week.innerText = `Week ${weekData.week}`;
            habit.renderDate(weekData);
            habit.renderProgressBars(weekData);
            
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
                    weekData.activities[$el.id].forEach(d => {
                        $el.appendChild(createActionEl(d));
                        if (d.typeId === 'jap') goalsJap++;
                        else if (d.typeId === 'fitness') goalsFitness++;
                        else if (d.typeId === 'js') goalsJS++;
                    });
                } else {
                    let d = weekData.activities[$el.id];
                    $el.appendChild(createConstantEl());
                    $el.appendChild(createActionEl(d));
                    if (d.typeId === 'jap') goalsJap++;
                    else if (d.typeId === 'fitness') goalsFitness++;
                    else if (d.typeId === 'js') goalsJS++;
                }
            });

            // Render goals indicator
            document.querySelector('.profile--bar.type--jap span').innerText = goalsJap === 0 ? '' : `+ ${goalsJap}`;
            document.querySelector('.profile--bar.type--fitness span').innerText = goalsFitness === 0 ? '' : `+ ${goalsFitness}`;
            document.querySelector('.profile--bar.type--js span').innerText = goalsJS === 0 ? '': `+ ${goalsJS}`;
        },
        renderDate: function(weekData) {
            const startDate = new Date(weekData.startDate),
                endDate = new Date(weekData.endDate);

            const startDateMonth = startDate.toLocaleString('default', { month: 'long' }).slice(0, 3),
                endDateMonth = endDate.toLocaleString('default', { month: 'long' }).slice(0, 3);

            habit.$date.innerText = `${startDate.getDate()} ${startDateMonth} - ${endDate.getDate()} ${endDateMonth}`
        },
        renderProgressBars: function(weekData) {
            let totalJap = 0, totalFitness = 0, totalJS = 0;
            let hpCount = 10, mpCount = 10;

            function countAction(action) {
                if (action.typeId === 'jap') totalJap++;
                else if (action.typeId === 'fitness') totalFitness++;
                else if (action.typeId === 'js') totalJS++;
            }

            function countHpMp(action) {
                hpCount = (action.typeId === 'rest') ? 10 : (hpCount - 1);
                mpCount = (action.typeId === 'social') ? 10 : (mpCount - 1);
            }

            const beforeThisWeek = habit.allData.filter(d => parseInt(d.week) <= parseInt(weekData.week));

            beforeThisWeek.forEach(dataPerWeek => {
                const activities = dataPerWeek.activities;
                const thisWeek = dataPerWeek === weekData;

                for (var k in activities) {
                    if (activities.hasOwnProperty(k)) {
                        if (k === 'saturday' || k === 'sunday') 
                            activities[k].forEach(action => {
                                countAction(action);
                                if (thisWeek) 
                                    countHpMp(action);
                            })
                        else {
                            countAction(activities[k]);
                            if (thisWeek)
                                countHpMp(activities[k]);
                        }
                    }
                }
            })


            // Render goals progress bar
            const $progressJap = document.querySelector('.profile--bar.type--jap');
            const $progressFitness = document.querySelector('.profile--bar.type--fitness');
            const $progressJS = document.querySelector('.profile--bar.type--js');

            $progressJap.style.width = `${(totalJap)/habit.PROGRESS_CONSTANT}rem`;
            $progressFitness.style.width = `${(totalFitness)/habit.PROGRESS_CONSTANT}rem`;
            $progressJS.style.width = `${(totalJS)/habit.PROGRESS_CONSTANT}rem`;

            // Render HP and MP bar
            const $hpBar = document.querySelector('.profile--bar.type--hp');
            const $mpBar = document.querySelector('.profile--bar.type--mp');
            const $hpText = document.querySelector('.profile--bar.type--hp span');
            const $mpText = document.querySelector('.profile--bar.type--mp span');

            $hpBar.style.width = `${hpCount*0.4}rem`;
            $mpBar.style.width = `${mpCount*0.4}rem`;
            $hpText.innerText = `${hpCount}/10`;
            $mpText.innerText = `${mpCount}/10`;

            hpCount < 5 ?
                $hpText.setAttribute('style', 'position: absolute; right: -23px; color: red;') :
                $hpText.removeAttribute('style')
            
            mpCount < 5 ?
                $mpText.setAttribute('style', 'position: absolute; right: -23px; color: red;') :
                $mpText.removeAttribute('style')
            
        },  
        renderNav: function(week) {
            let showPrevBtn = true, showNextBtn = true;
            
            if (week === habit.allData[0].week) {
                showPrevBtn = false;
                showNextBtn = true;
            } else if (week === habit.allData[habit.allData.length - 1].week) {
                showPrevBtn = true;
                showNextBtn = false;
            }

            habit.$prevBtn.style.visibility = showPrevBtn ? "visible" : "hidden";
            habit.$nextBtn.style.visibility = showNextBtn ? "visible" : "hidden";
        },
        eventListeners: function() {

            function goPrevPage() {
                const prevData = habit.allData.filter(d => parseInt(d.week) === parseInt(habit.currentData.week - 1));
                if (prevData.length > 0) {
                    habit.currentData = prevData[0];
                    habit.render(habit.currentData);
                }
            }

            function goNextPage() {
                const nextData = habit.allData.filter(d => parseInt(d.week) === parseInt(habit.currentData.week) + 1);
                if (nextData.length > 0) {
                    habit.currentData = nextData[0];
                    habit.render(habit.currentData);
                }
            }


            // Prev / Next button event listeners
            habit.$prevBtn.addEventListener("mousedown", goPrevPage);
            habit.$nextBtn.addEventListener("mousedown", goNextPage);

            // Arrow key left & right
            window.addEventListener('keydown', function(e) {
                if      (e.key === 'ArrowLeft')     goPrevPage();
                else if (e.key === 'ArrowRight')    goNextPage();
            })

            // Gesture swipe left and right
            window.addEventListener('touchstart', function(e) {
                habit.startTouchX = e.changedTouches[0].clientX;
            })

            window.addEventListener('touchend', function(e) {
                const changedX = e.changedTouches[0].clientX - habit.startTouchX;
                if      (changedX > 75)  goPrevPage();
                else if (changedX < -75) goNextPage();
            })

            // Hover
            document.querySelectorAll('.profile_goals .profile--bar').forEach($el => {
                $el.addEventListener('mouseenter', function(e) {
                    console.log('e :', e);
                    // if (e.target.classList.contains('type--jap')) {
                        const widthString = e.target.style.width;
                        const width = widthString.slice(0, widthString.indexOf('rem'));
                        const hours = parseFloat(width) * habit.PROGRESS_CONSTANT;

                        const $progressDetail = document.createElement('div');
                        $progressDetail.innerText = `Total time spent: ${hours} hours`;
                        $progressDetail.classList.add('progress_detail');
                        $progressDetail.style.top = `${e.y}px`;
                        $progressDetail.style.left = `${e.x}px`;

                        document.querySelector('body').appendChild($progressDetail);
                    // }
                })

                $el.addEventListener('mouseleave', function(e) {
                    document.querySelector('.progress_detail').remove();
                })

                // $el.addEventListener('touchstart', function(e) {
                //     // if (e.target.classList.contains('type--jap')) {
                //         const widthString = e.target.style.width;
                //         const width = widthString.slice(0, widthString.indexOf('rem'));
                //         const hours = parseFloat(width) * habit.PROGRESS_CONSTANT;

                //         const $progressDetail = document.createElement('div');
                //         $progressDetail.innerText = `Total time spent: ${hours} hours`;
                //         $progressDetail.classList.add('progress_detail');
                //         $progressDetail.style.top = `${e.y}px`;
                //         $progressDetail.style.left = `${e.x}px`;

                //         document.querySelector('body').appendChild($progressDetail);
                //     // }
                // })
            })


        }
    };

    habit.start();
})();
