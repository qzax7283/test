

const database = DATABASE_init();

console.log(database);
   
/*
const { err } = await supa.from("Events").insert({name: "所以呢？",  date:"2026-03-07", start_time:2214, end_time:3444, tag:5, details:"adfruites"});
*/
  
const calendar_title = document.querySelector(".calendar_title");
const days_container = document.querySelector(".days_container");

const add_event_wrapper = document.querySelector(".add_event_wrapper");
const html_element = document.documentElement;
const container = document.querySelector(".container");
const html_input_type = document.querySelectorAll("input");


const month_code = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekday_code = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const tags_name = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"];
const tags_clr = ["#e6b0aa", "#d7bde2", "#a9cce3", "#a2d9ce", "#fad7a0", "#d5dbdb"];/* tag 0 ~ 2 need to display open circle or check*/ 


/*generate week_no array*/
const w_2025_winter = Array.from({ length: 7 }, (_, i) => i + 2);  /*[2, 3, ..., 8]*/
const w_2025_spring = Array.from({ length: 16 }, (_, i) => i + 1); /*[1, 2, ..., 16]*/
const w_2025_summer = Array.from({ length: 12 }, (_, i) => i + 1);
const w_2025_fall =  Array.from({ length: 16 }, (_, i) => i + 1);
const w_2026_winter = Array.from({ length: 9 }, (_, i) => i + 1);

const week_no_arr = [...w_2025_winter, ...w_2025_spring, ...w_2025_summer, ...w_2025_fall, ...w_2026_winter];

const add_event_btn_html = `<div class="add_event_btn"><i class="fa-solid fa-plus"></i></div>`;
const scroll_event_btn_html = `<div class="scroll_event_btn"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></div>`;


const first_day = new Date(2024, 11, 30);
const today = new Date();

const event_inspect_footer = document.querySelector(".event_inspect_footer");
const event_inspect_main_icon = document.querySelector(".event_inspect_main_icon");

let database_connect_id = null;
let database_connect_done = null;
let database_connect_istask = null;
let interact_date_id = null;


function get_day_id(date){
    return Math.floor((date-first_day)/(1000*60*60*24));
}

function format_two_digits(num){
    return num < 10 ? `0${num}` : `${num}`;
}

function print_date(date){
    let month = month_code[date.getMonth()];
    let day = date.getDate();

    return month + " " + day;
}

function print_date_full(id){
    let date = null;
    if(id == -1){
        date = today;
    }
    else{
        date = new Date(2024, 11, 30+id);
    }
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    let weekday = weekday_code[date.getDay()];

    return year + "." + format_two_digits(month) + "." + format_two_digits(day) + " " + weekday;
}

function INSPECT_print_date(id){
    const date = new Date(2024, 11, 30+id);
    let month = date.getMonth()+1;
    let day = date.getDate();
    let weekday = weekday_code[date.getDay()];

    return format_two_digits(month) + "/" + format_two_digits(day) + " · " + weekday;
}


/* convert the "start time" & "end time" value from database for display */
function time_convert_display(target_data_start_time, target_data_end_time){
    let event_time = "";
    let start_time = number_to_time_string(target_data_start_time);
    let end_time = number_to_time_string(target_data_end_time);

    if((target_data_start_time == 720)&&(target_data_end_time == -1))       event_time = "morning";
    else if((target_data_start_time == 1080)&&(target_data_end_time == -1)) event_time = "afternoon";
    else if((target_data_start_time == 1440)&&(target_data_end_time == -1)) event_time = "night";
    else if((target_data_start_time == 0)&&(target_data_end_time == 0))     event_time = "all day";
    else if(target_data_end_time == 0)                                      event_time = start_time;
    else                                                                    event_time = start_time + " ~ " + end_time;
    
    return event_time;
}

/* place the position of today in the second row of the calendar */
function scroll_today(behavior){
    const scroll_pos = document.getElementById("d"+ (get_day_id(today)-7));
    days_container.scrollTo({ top: scroll_pos.offsetTop, behavior: behavior});
}

function ADD_EVENT_check(){
    let start_time = time_string_to_number(add_event_start_time_h.value, add_event_start_time_m.value);
    let end_time = time_string_to_number(add_event_end_time_h.value, add_event_end_time_m.value);
    if     (add_event_name.value == "")                                                               return 1
    else if(add_event_tag.value == "")                                                                return 1
    else if((start_time >= end_time)&&(end_time != 0))                                                return 1
    else if((Number(add_event_start_time_h.value) >= 24)||(Number(add_event_end_time_h.value) >= 24)) return 1
    else if((Number(add_event_start_time_m.value) >= 60)||(Number(add_event_end_time_m.value) >= 60)) return 1
    else if((add_event_start_time_h.value == "")||(add_event_start_time_m.value == "")||(add_event_end_time_h.value == "")||(add_event_end_time_m.value == "")){
        if((add_event_start_time_h.value == "")&&(add_event_start_time_m.value == "")&&
           (add_event_end_time_h.value == "")&&(add_event_end_time_m.value == ""))                    return 2
        else if((add_event_end_time_h.value == "")&&(add_event_end_time_m.value == ""))               return 3
        else                                                                                          return 1
    }               
    else                                                                                              return 0
}

function ADD_EVENT_close_n_clear(){
    document.getElementById("add_event_wrapper").classList.remove("active");
    timerange_icon_container.forEach(i => i.classList.remove("selected"));
    add_event_name.value = '';
    add_event_start_time_h.value = '';
    add_event_start_time_m.value = '';
    add_event_end_time_h.value = '';
    add_event_end_time_m.value = '';
    add_event_tag.value = "";
    add_event_details.value = "";
    event_tag = null;
    timerange = null;
    interact_date_id = null;
}

async function ADD_EVENT_confirm(){
    add_event_confirm_btn.style.color = "rgb(245, 255, 245)";
    add_event_confirm_btn.style.backgroundColor =  "rgb(133, 164, 133)";

    let start_time = null;
    let end_time = null;

    if(timerange == 0){      /* morning */
        start_time = 720;
        end_time = -1;
    }      
    else if(timerange == 1){ /* afternoon */
        start_time = 1080;
        end_time = -1;
    }
    else if(timerange == 2){ /* night */
        start_time = 1440;
        end_time = -1;
    }
    else{
        start_time = time_string_to_number(add_event_start_time_h.value, add_event_start_time_m.value);
        end_time = time_string_to_number(add_event_end_time_h.value, add_event_end_time_m.value);
    }
    await DATABASE_update(add_event_name.value, start_time, end_time, event_tag, add_event_details.value);
}

function time_string_to_number(hour, minute){
    return Number(hour)*60 + Number(minute);
}

function number_to_time_string(num){
    let hour = format_two_digits(Math.floor(num / 60));
    let minute = format_two_digits((num % 60));

    return hour + ":" + minute;
}

function DATABASE_init(){

    /*localStorage.setItem("URL", URL);  // Store token
    /*localStorage.setItem("KEY", KEY);  // Store token*/

    
    const URL = localStorage.getItem("URL");
    const KEY = localStorage.getItem("KEY");

    return supabase.createClient(URL, KEY);
}

async function DATABASE_update(name, start_time, end_time, tag, details){
    const { err } = await database.from("Events").insert({
        name: name,
        date_id: interact_date_id,
        start_time: start_time,
        end_time: end_time,
        tag: tag,
        details: details
    });
}

async function DATABASE_update_done(id, done){
    const { data, error } = await database
        .from("Events")
        .update({ done: !done })
        .eq("id", id);
}

async function DATABASE_delete(id){
    const { data, error } = await database
        .from("Events")
        .delete()
        .eq("id", id);
}



async function EVENT_display(){
    const event_display = document.querySelectorAll(".event");
    const { data, error } = await database
        .from("Events")
        .select("*")
        .order("start_time", {ascending: true})
        .order("end_time", {ascending: true});
    let target_data = null;
    let event_time = "";
    let tag = null;

    console.log(data);
    console.log(error);


    for(let i = 0; i < data.length; i++){
        target_data = data[i];

        event_time = time_convert_display(target_data.start_time, target_data.end_time);

        tag = target_data.tag;
        const target_event_div = document.getElementById(target_data.date_id + "_e");
        let event_content = "";
        /* this event need to display open circle or check */
        if(tag < 3){
            let event_status_icon = null;
            if(target_data.done == false){
                event_status_icon = `<i class="fa-solid fa-caret-up" style="color:rgba(255, 213, 59, 0.65);"></i>`;
            }
            else{
                event_status_icon = `<i class="fa-solid fa-check" style="color: #63E6BE;"></i>`;
            }
            event_content = `<div id="${target_data.id}_event" class="event_content">
                                <div class="event_name tag_clr_${tag}">${target_data.name}</div>
                                <div class="event_time_status_container">
                                    <div class="event_time">${event_time}</div>
                                    <div class="event_status">${event_status_icon}</div>
                                </div>
                            </div>`;
        }
        else{
            event_content = `<div id="${target_data.id}_event" class="event_content">
                                <div class="event_name tag_clr_${tag}">${target_data.name}</div>
                                <div class="event_time_status_container">
                                    <div class="event_time">${event_time}</div>
                                </div>
                            </div>`;
        }
        target_event_div.innerHTML += event_content;

    }

    await TASK_display();
  
    /* for checking whether need to display the expand event display button*/
    event_display.forEach((div, index) => {
        const tmp_div = document.getElementById("d"+index);
        const scroll_event_btn_target = tmp_div.querySelector(".scroll_event_btn")
        
        if(div.scrollHeight > div.clientHeight){
            scroll_event_btn_target.classList.add("active");
        }
        
    });
}

/* task display */
async function TASK_display(){
    const task_body = document.querySelector(".task_body");
    task_body.innerHTML = "";
    const { data, error } = await database
        .from("Events")
        .select("*")
        .lte("tag", 2)
        .order("date_id", {ascending: true})
        .order("start_time", {ascending: true});

    let target_data = null;
    let tag = null;

    for(let i = 0; i < data.length; i++){
        target_data = data[i];
        tag = target_data.tag;

        let day_diff = target_data.date_id - get_day_id(today);
        if((day_diff > 0)&&(day_diff < 100)){
            let task_content =  `<div id = "${target_data.id}_task"class="task_content_container">
                                    <div class="task_day_count">D+${day_diff}</div>
                                    <div class="task_divider">·</div>
                                    <div class="task_content tag_clr_${tag}">${target_data.name}</div>
                                </div>`;
                                                                    
            task_body.innerHTML += task_content;
        }
    }
}



async function EVENT_single_display(){
    /*await new Promise(resolve => setTimeout(resolve, 500));*/ /* use await DATABASE_update solved */
    const { data, error } = await database
        .from("Events")
        .select("*")
        .eq("date_id", date_id)
        .order("start_time", {ascending: true})
        .order("end_time", {ascending: true});

    let target_data = null;
    let start_time = "";
    let end_time = "";
    let event_time = "";
    let tag = null;
    const target_event_div = document.getElementById(date_id + "_e");
    target_event_div.innerHTML = "";
   
    for(let i = 0; i < data.length; i++){
        target_data = data[i];
        start_time = number_to_time_string(target_data.start_time);
        end_time = number_to_time_string(target_data.end_time);

        if((target_data.start_time == 720)&&(target_data.end_time == -1)) event_time = "morning";
        else if((target_data.start_time == 1080)&&(target_data.end_time == -1)) event_time = "afternoon";
        else if((target_data.start_time == 1440)&&(target_data.end_time == -1)) event_time = "night";
        else if((target_data.start_time == 0)&&(target_data.end_time == 0)) event_time = "all day";
        else if(target_data.end_time == 0)                             event_time = start_time;
        else                                                           event_time = start_time + " ~ " + end_time;

        tag = target_data.tag;
        
        let content = `<div class="event_content"><div class="event_name tag_clr_${tag}">${target_data.name}</div><div class="event_time">${event_time}</div></div>`;
        target_event_div.innerHTML += content;
    }   
}

async function EVENT_oneday_display(){
    const { data, error } = await database
        .from("Events")
        .select("*")
        .eq("date_id", interact_date_id)
        .order("start_time", {ascending: true})
        .order("end_time", {ascending: true});

    let target_data = null;
    let event_time = "";
    let tag = null;
    const target_event_div = document.getElementById(interact_date_id + "_e");
    
    target_event_div.innerHTML = "";

    for(let i = 0; i < data.length; i++){
        target_data = data[i];

        event_time = time_convert_display(target_data.start_time, target_data.end_time);

        tag = target_data.tag;

        let event_content = "";
        /* this event need to display open circle or check */
        if(tag < 3){
            let event_status_icon = null;
            if(target_data.done == false){
                event_status_icon = `<i class="fa-solid fa-caret-up" style="color:rgba(255, 213, 59, 0.65);"></i>`;
            }
            else{
                event_status_icon = `<i class="fa-solid fa-check" style="color: #63E6BE;"></i>`;
            }
            event_content = `<div id="${target_data.id}_event" class="event_content">
                                <div class="event_name tag_clr_${tag}">${target_data.name}</div>
                                <div class="event_time_status_container">
                                    <div class="event_time">${event_time}</div>
                                    <div class="event_status">${event_status_icon}</div>
                                </div>
                            </div>`;
        }
        else{
            event_content = `<div id="${target_data.id}_event" class="event_content">
                                <div class="event_name tag_clr_${tag}">${target_data.name}</div>
                                <div class="event_time_status_container">
                                    <div class="event_time">${event_time}</div>
                                </div>
                            </div>`;
        }
        target_event_div.innerHTML += event_content;
    }
    /* reattach the eventlistener */
    event_content_AEL(target_event_div.querySelectorAll(".event_content"));

    await TASK_display();

    /*expand event button check*/
    const div  = document.getElementById(interact_date_id + "_e");
    const scroll_event_btn_target = document.getElementById("d" + interact_date_id).querySelector(".scroll_event_btn");

    if(div.scrollHeight > div.clientHeight){
        scroll_event_btn_target.classList.add("active");
    }
    else{
        scroll_event_btn_target.classList.remove("active");
    }
    /*=========================*/

    interact_date_id = null;


    /*
    const event_display = document.querySelectorAll(".event");
    event_display.forEach((div, index) => {
        const tmp_div = document.getElementById("d"+index);
        const scroll_event_btn_target = tmp_div.querySelector(".scroll_event_btn");
        
        if(div.scrollHeight > div.clientHeight){
            scroll_event_btn_target.classList.add("active");
        }
        else{
            scroll_event_btn_target.classList.remove("active");
        }
    });
    */
}

function INSPECT_generate(div, event){

    event_inspect_done.classList.remove("active");
    event_inspect_delete_confirm.classList.remove("active");

    document.querySelector(".event_inspect_name").innerHTML = "";
    document.querySelector(".event_inspect_time").innerHTML = "";
    document.querySelector(".event_inspect_detail_data").innerHTML = "";
    event_inspect_main_icon.innerHTML = "";

    let rect = div.getBoundingClientRect();

        if(rect.left < 600){
            event_inspect.style.left = rect.left + rect.width + 6 + "px";
        }
        else{
            event_inspect.style.left = rect.left - 2*rect.width - 24 + "px";
        }
        if(rect.top > 610){
            event_inspect.style.top = 603 + "px";
        }
        else{
            event_inspect.style.top = rect.top + "px";
        }
        event_inspect.classList.add("active");
}

async function INSPECT_load(event) {
    let id = parseInt(event.target.id, 10);

    const { data, error } = await database
        .from("Events")
        .select("*")
        .eq("id", id)
        .single();

    database_connect_id = id;
    database_connect_done = data.done;


    document.querySelector(".event_inspect_name").innerHTML = data.name;

    let date = INSPECT_print_date(data.date_id);
    let time = time_convert_display(data.start_time, data.end_time);
    document.querySelector(".event_inspect_time").innerHTML = date + " · " + time;

    document.querySelector(".event_inspect_detail_data").innerHTML = data.details;

    if(database_connect_done == false){
        document.querySelector(".event_inspect_done").innerHTML = "Mark as done";
        event_inspect_main_icon.innerHTML = `<i class="fa-solid fa-square"></i>`;
        event_inspect_main_icon.style.color = tags_clr[data.tag];
    }
    else{
        document.querySelector(".event_inspect_done").innerHTML = "Mark as undone";
        event_inspect_main_icon.innerHTML = `<i class="fa-solid fa-check"></i>`;
        event_inspect_main_icon.style.color = "rgb(4, 197, 107)";
    }

    database_connect_istask = (data.tag < 3);

    
    if(database_connect_istask){
        event_inspect_done.classList.add("active");
    }
    
}

function INSPECT_close(){
    event_inspect_done.classList.remove("active");
    event_inspect_delete_confirm.classList.remove("active");
    event_inspect.classList.remove("active");
    database_connect_id = null;
    database_connect_done = null;
    database_connect_istask = null;
}


/* disable auto-filling */
html_input_type.forEach(input => {
    input.setAttribute('autocomplete', 'off');
});



document.addEventListener('click', (event) => {
    if (document.fullscreenElement == null) {
        /* Ensure this is fast and non-blocking */
        html_element.requestFullscreen().then(() => {
            scroll_today("auto");
        });
    }
    else if((event.target.className != "event_content")&&(!document.querySelector(".event_inspect").contains(event.target))){
        INSPECT_close();
    }

});




let add_days_n_events = "";

let idx = 0;
let class_type = "date";

for(let i = 0; i < 52; i++){
    idx = 7*i;

    add_days_n_events += `<div id="w${i}" div class="week_date"><div>w${week_no_arr[i]}</div></div>`;
    
    for(let j = 0; j < 7; j++){

        if(j < 5){
            class_type = "date";
        }
        else{
            class_type = "holiday";
        }
        
        add_days_n_events += `<div id="d${idx+j}" div class=${class_type}>${scroll_event_btn_html}<div>${print_date(new Date(2024, 11, 30+idx+j))}</div>${add_event_btn_html}</div>`;
    }

    add_days_n_events += `<div id="we${i}" div class="week_event"></div>`;

    for(let j = 0; j < 7; j++){
        add_days_n_events += `<div id="${(7*i)+j}_e" div class="event"></div>`;
    }
}

days_container.innerHTML = add_days_n_events;


/* color today as green */
document.getElementById("d"+ get_day_id(today)).className = "today";


scroll_today("auto");



const targetDiv = document.getElementById("year_season");
targetDiv.innerHTML = "2025" + " " + "Winter";


const add_event_btn = document.querySelectorAll(".add_event_btn");

/*let date_id = null; /* to record which date event to be added */
let event_tag = null;
let timerange = null;

add_event_btn.forEach((button, index) => {
    button.addEventListener("click", () => {
        /* check whether the class "active" has been toggled */
        if(document.getElementById("add_event_wrapper").classList.contains("active")){
            /* nothing happen */
        }
        else{
            interact_date_id = index;
            add_event_wrapper.classList.toggle("active");
            document.getElementById("add_event_title").innerHTML = "-- " + print_date_full(index) + " --";
            add_event_name.focus();
            add_event_confirm_btn.style.color = "";
            add_event_confirm_btn.style.backgroundColor =  "";
        }
    });
});

/* if the add event page is closed */
const add_event_close_btn = document.querySelector(".add_event_close_btn");


add_event_close_btn.addEventListener("click", ADD_EVENT_close_n_clear);


const add_event_name = document.getElementById("add_event_name");
const add_event_start_time_h = document.getElementById("add_event_start_time_h");
const add_event_start_time_m = document.getElementById("add_event_start_time_m");
const add_event_end_time_h = document.getElementById("add_event_end_time_h");
const add_event_end_time_m = document.getElementById("add_event_end_time_m");
const add_event_tag = document.getElementById("add_event_tag");


const input_tag_icon_container = document.querySelectorAll(".input_tag_icon_container")
const add_event_details = document.getElementById("add_event_details");

add_event_name.addEventListener("keyup", (e) =>{
    if((e.key == "Enter")&&(add_event_name.value.length > 0)){
        add_event_start_time_h.focus();
    }
});

add_event_start_time_h.addEventListener("keyup", (e) => {
    if((e.key == "Enter")&&(add_event_start_time_h.value.length == 0)){
        input_tag_icon_container[0].focus();
    }
    else if((e.key == "ArrowRight")&&(add_event_start_time_h.value.length == 0)){
        add_event_start_time_h.blur();
        timerange_icon_container[0].focus();
    }
    else if((e.key != "Backspace")&&(add_event_start_time_h.value.length == 2)){
        add_event_start_time_m.focus();
    }
});

add_event_start_time_m.addEventListener("keyup", (e) => {
    if((e.key != "Backspace")&&(add_event_start_time_m.value.length == 2)){
        add_event_end_time_h.focus();
    }
});

add_event_end_time_h.addEventListener("keyup", (e) => {
    if((e.key == "Enter")&&(add_event_end_time_h.value.length == 0)){
        input_tag_icon_container[0].focus();
    }
    else if((e.key != "Backspace")&&(add_event_end_time_h.value.length == 2)){
        add_event_end_time_m.focus();
    }
});

add_event_end_time_m.addEventListener("keyup", (e) => {
    if((e.key != "Backspace")&&(add_event_end_time_m.value.length == 2)){
        input_tag_icon_container[0].focus();
    }
});

add_event_start_time_h.addEventListener("focus", () => {
    timerange_icon_container.forEach(i => i.classList.remove("selected"));
    timerange = null;
});

add_event_start_time_m.addEventListener("focus", () => {
    timerange_icon_container.forEach(i => i.classList.remove("selected"));
    timerange = null;
});

add_event_end_time_h.addEventListener("focus", () => {
    timerange_icon_container.forEach(i => i.classList.remove("selected"));
    timerange = null;
});

add_event_end_time_m.addEventListener("focus", () => {
    timerange_icon_container.forEach(i => i.classList.remove("selected"));
    timerange = null;
});


input_tag_icon_container.forEach((tags, index) => {
    tags.addEventListener("keydown", (e) => {
        if(e.key == "ArrowRight"){
            if(index != 5){
                input_tag_icon_container[index+1].focus();
            }
            else{
                input_tag_icon_container[0].focus();
            }
        }
        else if(e.key == "Enter"){
            add_event_details.focus();
        }
    });
});
input_tag_icon_container.forEach((tags, index) => {
    tags.addEventListener("focus", () => {
        add_event_tag.value = tags_name[index];
        event_tag = index;
    })
});



add_event_details.addEventListener("keydown", async(e) => {
    if((e.key == "Enter")&&(document.getElementById("add_event_wrapper").classList.contains("active"))){
        let check_result = ADD_EVENT_check();
        /*the input data is invalid*/
        console.log(check_result);
        if(check_result == 1){
            container.classList.toggle("blurred");
            warning_container.classList.toggle("active");
        }
        /*the input data is valid*/
        else{
            
            await ADD_EVENT_confirm();
            await EVENT_oneday_display();
            ADD_EVENT_close_n_clear();
        }
    }
});


const add_event_confirm_btn = document.querySelector(".add_event_confirm_btn");
add_event_confirm_btn.addEventListener("click", async() => {
    let check_result = ADD_EVENT_check();
    console.log(check_result);
    /*the input data is invalid*/
    if(check_result == 1){
        container.classList.toggle("blurred");
        warning_container.classList.toggle("active");
    }
    /*the input data is valid*/
    else{
        
        await ADD_EVENT_confirm();
        await EVENT_oneday_display();
        ADD_EVENT_close_n_clear();
    }
});


const scroll_event_btn = document.querySelectorAll(".scroll_event_btn");

await EVENT_display();


/*
function insertNewDiv() {
    // Create the new div
    const newDiv = document.createElement("div");

    newDiv.className = "date";
    newDiv.textContent = "New Date";

    // Insert the new div dynamically at a specific location
    const referenceDiv = document.querySelector(".week_date:nth-child(1)"); // Example: Insert after the 10th date div
    console.log(referenceDiv);
    referenceDiv.insertAdjacentElement("afterend", newDiv);
}
*/
/*insertNewDiv();*/
/*
const new_event = new Map();
*/
const warning_container = document.querySelector(".warning_container");
const warning_btn = document.querySelector(".warning_btn");


warning_btn.addEventListener("click", () => {

    warning_container.classList.remove("active");
    container.classList.remove("blurred");
});




document.querySelector(".today_todo_header").innerHTML = `<div class="today_btn"><i class="fa-regular fa-calendar-day"></i></div>` + print_date_full(-1);

const today_btn = document.querySelector(".today_btn");

/* today button */
today_btn.addEventListener("click", () => {
    scroll_today("smooth");
});





const timerange_icon_container = document.querySelectorAll(".timerange_icon_container");


timerange_icon_container.forEach((tags, index) => {
    tags.addEventListener("keyup", (e) => {
        if(e.key == "ArrowRight"){
            if(index != 2){
                timerange_icon_container[index+1].focus();
            }
            else{
                add_event_start_time_h.focus();
            }
        }
        else if(e.key == "Enter"){
            input_tag_icon_container[0].focus();
        }
    });
});

timerange_icon_container.forEach((tags, index) => {
    tags.addEventListener("focus", () => {
        timerange_icon_container.forEach(i => i.classList.remove("selected"));
        tags.classList.add("selected");
        timerange = index;
    })
});







/* function of scroll event button */
scroll_event_btn.forEach((button, index) => {
    button.addEventListener("click", () => {
        const target_1 = document.getElementById(index+"_e");
        const target_2 = document.getElementById("d"+index).querySelector(".scroll_event_btn");
        /* expand the display region */
        target_1.classList.toggle("expand");
        /* change the icon after expanded */
        target_2.classList.toggle("active");
        target_2.classList.toggle("focus");
    });
});


const task_content_container = document.querySelectorAll(".task_content_container");



task_content_container.forEach((button) => {
    button.addEventListener("click", (event) => {
        console.log("Clicked div ID:", event.target.id);
        let rect = button.getBoundingClientRect();
        console.log({top: rect.top, left: rect.left});
    });
});


const event_inspect = document.querySelector(".event_inspect");



event_content_AEL(document.querySelectorAll(".event_content"));


const event_inspect_done = document.querySelector(".event_inspect_done");

event_inspect_done.addEventListener("click", async() => {
    await DATABASE_update_done(database_connect_id, database_connect_done);
    INSPECT_close();
    EVENT_oneday_display();
});



const event_inspect_close_btn = document.querySelector(".event_inspect_close_btn");
event_inspect_close_btn.addEventListener("click", INSPECT_close);

const event_inspect_delete_btn = document.querySelector(".event_inspect_delete_btn");
const event_inspect_delete_confirm = document.querySelector(".event_inspect_delete_confirm");

event_inspect_delete_btn.addEventListener("click", () => {
    if(database_connect_istask){
        event_inspect_done.classList.toggle("active");
    }
    event_inspect_delete_confirm.classList.toggle("active");
})

event_inspect_delete_confirm.addEventListener("click", async() => {
    await DATABASE_delete(database_connect_id);
    INSPECT_close();
    EVENT_oneday_display();
});





/*

const parentDiv = document.getElementById("e26");

const childDiv = document.createElement('div');
childDiv.textContent = "今天天氣很好的樣子"

parentDiv.appendChild(childDiv);

const childDiv1 = document.createElement('div');
childDiv1.textContent = "another event"
parentDiv.appendChild(childDiv1);


let add_content0 = `<div class="event_content"><div class="event_name">今天天氣很好</div><div class="event_time">23:33</div></div>`;
let add_content1 = `<div class="event_content"><div class=<div class="event_name">今天天氣很好</div><div class="event_time">23:33</div></div>`;
let add_content2 = `<div class="event_content"><div class="event_name">今天天氣很好</div><div class="event_time">03:00 ~ 22:45</div></div>`;
let add_content3 = `<div class="event_content"><div class="event_name">Moon Festival</div><div class="event_time">all day</div></div>`;
/*
for(let i = 0; i<5; i++){
    const new_div = document.createElement("div");
    new_div.textContent = "今天天氣很好"

    new_div.classList.add("event_content");

    aaa.appendChild(new_div);

}
*/

/* add the eventlistener to ".event_content" */
function event_content_AEL(scope){
    scope.forEach((div) => {
        div.addEventListener("click", async(event) => {
            interact_date_id = parseInt(event.target.parentElement.id, 10);
            INSPECT_generate(div, event);
            await INSPECT_load(event);
        });
    });
}