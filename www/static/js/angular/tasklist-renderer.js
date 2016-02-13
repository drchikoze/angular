/**
 * Created by Vasiliy on 04.02.15.
 */

function toggleTask(taskId) {
    $('.task' + taskId).toggle();
}

function showAllTask() {
    $('.task').show();
    $('.task-hide').hide();
}
function hideAllTask() {
    $('.task').hide();
    $('.task-hide').show();
}