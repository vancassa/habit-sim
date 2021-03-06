(function() {
    var habit = {
        SKILL_1: 'jap',
        SKILL_2: 'fitness',
        SKILL_3: 'js',
        PROGRESS_CONSTANT: 10,
        STATS_WIDTH: 0.4,
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
            let goal1 = 0, goal2 = 0, goal3 = 0;

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
                actionTitle.innerText = title ? title : typeId;
                // const actionDesc = document.createElement("span");
                // actionDesc.classList.add("activity_action_item--desc");
                // actionDesc.innerText = desc;

                action.appendChild(actionTitle);
                // action.appendChild(actionDesc);

                action.addEventListener('mouseenter', function(e) {
                    if (desc !== '') {
                        const $desc = document.createElement('div');
                        $desc.classList.add('activity_action--desc');
                        $desc.innerText = desc;
                        e.target.appendChild($desc);
                    } 
                })

                action.addEventListener('mouseleave', function(e) {
                    const $desc = document.querySelector('.activity_action--desc');
                    if ($desc) $desc.remove();
                })

                return action;
            }

            function createConstantEl() {
                const constantAction = document.createElement('div');
                constantAction.className = 'activity_action_item type--constant';
                const constantActionTitle = document.createElement('span');
                constantActionTitle.classList.add('activity_action_item--title');
                constantActionTitle.innerText = habit.SKILL_3;
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
                        if (d.typeId === habit.SKILL_1) goal1++;
                        else if (d.typeId === habit.SKILL_2) goal2++;
                        else if (d.typeId === habit.SKILL_3) goal3++;
                    });
                } else {
                    let d = weekData.activities[$el.id];
                    $el.appendChild(createConstantEl());
                    $el.appendChild(createActionEl(d));
                    if (d.typeId === habit.SKILL_1) goal1++;
                    else if (d.typeId === habit.SKILL_2) goal2++;
                    else if (d.typeId === habit.SKILL_3) goal3++;
                }
            });

            // Render goals indicator
            document.querySelector('.profile--bar.type--1 span').innerText = goal1 === 0 ? '' : `+ ${goal1}`;
            document.querySelector('.profile--bar.type--2 span').innerText = goal2 === 0 ? '' : `+ ${goal2}`;
            document.querySelector('.profile--bar.type--3 span').innerText = goal3 === 0 ? '': `+ ${goal3}`;
        },
        renderDate: function(weekData) {
            const startDate = new Date(weekData.startDate),
                endDate = new Date(weekData.endDate);

            const startDateMonth = startDate.toLocaleString('default', { month: 'long' }).slice(0, 3),
                endDateMonth = endDate.toLocaleString('default', { month: 'long' }).slice(0, 3);

            habit.$date.innerText = `${startDate.getDate()} ${startDateMonth} - ${endDate.getDate()} ${endDateMonth}`
        },
        renderProgressBars: function(weekData) {
            let total1 = 0, total2 = 0, total3 = 0;
            let hpCount = 10, mpCount = 10;

            function countAction(action) {
                if (action.typeId === habit.SKILL_1) total1++;
                else if (action.typeId === habit.SKILL_2) total2++;
                else if (action.typeId === habit.SKILL_3) total3++;
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
            const $progress1 = document.querySelector('.profile--bar.type--1');
            const $progress2 = document.querySelector('.profile--bar.type--2');
            const $progress3 = document.querySelector('.profile--bar.type--3');

            $progress1.style.width = `${(total1)/habit.PROGRESS_CONSTANT}rem`;
            $progress2.style.width = `${(total2)/habit.PROGRESS_CONSTANT}rem`;
            $progress3.style.width = `${(total3)/habit.PROGRESS_CONSTANT}rem`;

            // Render HP and MP bar
            const $hpBar = document.querySelector('.profile--bar.type--hp');
            const $mpBar = document.querySelector('.profile--bar.type--mp');
            const $hpText = document.querySelector('.profile--bar.type--hp span');
            const $mpText = document.querySelector('.profile--bar.type--mp span');

            $hpBar.style.width = (hpCount < 0) ? `0` : `${hpCount*habit.STATS_WIDTH}rem`;
            $mpBar.style.width = (mpCount < 0) ? `0` :  `${mpCount*habit.STATS_WIDTH}rem`;
            $hpText.innerText = `${hpCount}/10`;
            $mpText.innerText = `${mpCount}/10`;

            hpCount < 5 ?
                $hpText.setAttribute('style', 'position: absolute; right: -23px; color: red;') :
                $hpText.removeAttribute('style')
            
            mpCount < 5 ?
                $mpText.setAttribute('style', 'position: absolute; right: -23px; color: red;') :
                $mpText.removeAttribute('style')

            // Render HP and MP container
            document.querySelectorAll('.profile_bar_container').forEach($el => $el.style.width = `${habit.PROGRESS_CONSTANT * habit.STATS_WIDTH}rem`);
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

            // Hover on progress bar - show progress details
            function showProgressDetail(hours, x, y) {
                const $progressDetail = document.createElement('div');
                $progressDetail.innerText = `Total time spent: ${hours} hours`;
                $progressDetail.classList.add('progress_detail');
                $progressDetail.style.top = `${y}px`;
                $progressDetail.style.left = `${x}px`;

                document.querySelector('body').appendChild($progressDetail);
            }

            function removeProgressDetail() {
                const $progressDetail = document.querySelector('.progress_detail');
                if ($progressDetail) $progressDetail.remove();
            }

            // Mouse hover events
            document.querySelectorAll('.profile_goals .profile--bar').forEach($el => {
                $el.addEventListener('mouseenter', function(e) {
                    const widthString = e.target.style.width;
                    const width = widthString.slice(0, widthString.indexOf('rem'));
                    const hours = parseFloat(width) * habit.PROGRESS_CONSTANT;

                    showProgressDetail(hours, e.x, e.y);
                })

                $el.addEventListener('mouseleave', function(e) {
                    document.querySelector('.progress_detail').remove();
                })
            })

            // Touch events
            document.querySelector('body').addEventListener('touchstart', function(e) {
                removeProgressDetail();

                if (e.target.classList.contains('profile--bar') &&
                    e.target.parentElement.classList.contains('profile_goals'))
                {
                    const widthString = e.target.style.width;
                    const width = widthString.slice(0, widthString.indexOf('rem'));
                    const hours = parseFloat(width) * habit.PROGRESS_CONSTANT;

                    showProgressDetail(hours, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                }
                else {
                    removeProgressDetail();
                }
            })
        }
    };

    habit.start();
})();
