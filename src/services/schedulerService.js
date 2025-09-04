const cron = require('cron');
const TaskAssignmentService = require('./taskAssignmentService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Запустить все планировщики
   */
  start() {
    console.log('⏰ Запуск планировщиков задач...');
    
    // Назначение задач каждый день в 9:00
    this.scheduleTaskAssignment();
    
    // Проверка завершенных задач каждый час
    this.scheduleCompletedTasksCheck();
    
    console.log('✅ Планировщики запущены');
  }

  /**
   * Остановить все планировщики
   */
  stop() {
    console.log('⏹️  Остановка планировщиков...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Планировщик "${name}" остановлен`);
    });
    
    this.jobs.clear();
    console.log('✅ Все планировщики остановлены');
  }

  /**
   * Планировщик назначения задач
   */
  scheduleTaskAssignment() {
    const job = new cron.CronJob('0 9 * * *', async () => {
      console.log('🕘 9:00 - Начинаем назначение задач премиум пользователям');
      try {
        const result = await TaskAssignmentService.assignTasksToPremiumUsers();
        console.log(`✅ Назначение задач завершено: ${result.assignedTasks} задач назначено`);
      } catch (error) {
        console.error('❌ Ошибка назначения задач:', error);
      }
    }, null, true, 'Europe/Moscow');

    this.jobs.set('taskAssignment', job);
    console.log('📅 Планировщик назначения задач: каждый день в 9:00');
  }

  /**
   * Планировщик проверки завершенных задач
   */
  scheduleCompletedTasksCheck() {
    const job = new cron.CronJob('0 * * * *', async () => {
      console.log('🕐 Проверяем завершенные задачи...');
      try {
        await TaskAssignmentService.checkCompletedTasks();
        console.log('✅ Проверка завершенных задач завершена');
      } catch (error) {
        console.error('❌ Ошибка проверки завершенных задач:', error);
      }
    }, null, true, 'Europe/Moscow');

    this.jobs.set('completedTasksCheck', job);
    console.log('📅 Планировщик проверки завершенных задач: каждый час');
  }

  /**
   * Запустить назначение задач немедленно (для тестирования)
   */
  async runTaskAssignmentNow() {
    console.log('🚀 Запуск назначения задач немедленно...');
    try {
      const result = await TaskAssignmentService.assignTasksToPremiumUsers();
      console.log(`✅ Назначение задач завершено: ${result.assignedTasks} задач назначено`);
      return result;
    } catch (error) {
      console.error('❌ Ошибка назначения задач:', error);
      throw error;
    }
  }

  /**
   * Запустить проверку завершенных задач немедленно (для тестирования)
   */
  async runCompletedTasksCheckNow() {
    console.log('🚀 Запуск проверки завершенных задач немедленно...');
    try {
      await TaskAssignmentService.checkCompletedTasks();
      console.log('✅ Проверка завершенных задач завершена');
    } catch (error) {
      console.error('❌ Ошибка проверки завершенных задач:', error);
      throw error;
    }
  }

  /**
   * Получить статус планировщиков
   */
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }
}

// Создаем единственный экземпляр
const schedulerService = new SchedulerService();

module.exports = schedulerService;
