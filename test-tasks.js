// Тестовый скрипт для демонстрации структуры задач
const { graphicDesignerTasks } = require('./tasks-data');

console.log('🎨 ДЕМОНСТРАЦИЯ ЗАДАЧ ДЛЯ ГРАФИЧЕСКОГО ДИЗАЙНЕРА\n');

console.log(`📊 Всего задач: ${graphicDesignerTasks.length}\n`);

// Группируем по категориям
const categories = {};
graphicDesignerTasks.forEach(task => {
  if (!categories[task.group]) {
    categories[task.group] = [];
  }
  categories[task.group].push(task);
});

console.log('📋 КАТЕГОРИИ ЗАДАЧ:');
Object.keys(categories).forEach(group => {
  console.log(`\n🔹 ${group}: ${categories[group].length} задач`);
  categories[group].forEach((task, index) => {
    console.log(`   ${index + 1}. ${task.title}`);
    console.log(`      ⏱️  Время: ${task.estimatedTime} ${task.timeUnit}`);
    console.log(`      📈 Уровень: ${task.difficulty} (${task.level}/10)`);
    console.log(`      🏢 Клиент: ${task.client.name} (${task.client.industry})`);
    console.log(`      📝 Описание: ${task.shortDescription}`);
    console.log('');
  });
});

console.log('\n🎯 ПРИМЕР ДЕТАЛЬНОЙ ЗАДАЧИ:');
const exampleTask = graphicDesignerTasks[0];
console.log(`\n📌 ${exampleTask.title}`);
console.log(`📝 ${exampleTask.description}`);
console.log(`\n⏱️  Время выполнения: ${exampleTask.estimatedTime} ${exampleTask.timeUnit}`);
console.log(`📅 Дедлайн: ${exampleTask.deadline} дней`);
console.log(`📈 Сложность: ${exampleTask.difficulty} (уровень ${exampleTask.level}/10)`);
console.log(`🏢 Клиент: ${exampleTask.client.name} (${exampleTask.client.industry})`);

console.log('\n📦 МАТЕРИАЛЫ:');
exampleTask.materials.forEach((material, index) => {
  console.log(`   ${index + 1}. ${material.name} (${material.type}) ${material.isRequired ? '✅' : '⚪'}`);
});

console.log('\n📤 РЕЗУЛЬТАТЫ:');
exampleTask.deliverables.forEach((deliverable, index) => {
  console.log(`   ${index + 1}. ${deliverable.name} (${deliverable.format}) ${deliverable.isRequired ? '✅' : '⚪'}`);
});

console.log('\n📋 ТРЕБОВАНИЯ:');
exampleTask.requirements.forEach((requirement, index) => {
  console.log(`   ${index + 1}. ${requirement}`);
});

console.log('\n🛠️  ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:');
console.log(`   ПО: ${exampleTask.technicalRequirements.software.join(', ')}`);
console.log(`   Форматы: ${exampleTask.technicalRequirements.fileFormats.join(', ')}`);
console.log(`   Размер: ${exampleTask.technicalRequirements.dimensions.width}x${exampleTask.technicalRequirements.dimensions.height} ${exampleTask.technicalRequirements.dimensions.unit}`);
console.log(`   Разрешение: ${exampleTask.technicalRequirements.resolution} DPI`);
console.log(`   Цветовая модель: ${exampleTask.technicalRequirements.colorMode}`);

console.log('\n🏷️  ТЕГИ:');
console.log(`   ${exampleTask.tags.join(', ')}`);

console.log('\n✨ СТРУКТУРА ГОТОВА ДЛЯ ИНТЕГРАЦИИ В СИСТЕМУ!');
