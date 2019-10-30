(function(){
    var habit = {
        $week: document.querySelector('.week'),
        start: function(){
            habit.loadData(function(data) {
                habit.render(data);
            });
        },
        loadData: function(fn){
            fetch("data.json")
                .then(res => res.json())
                .then(response => fn(response));
        },
        render: function(data){
            console.log('data :', data);
            habit.$week.innerText = `Week ${data[0].week}`;
        }
    };

    habit.start();
})();
