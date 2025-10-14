<template lang="pug">
div
  q-card(flat)
    div
      // Виджет статистики по проектам
      TimeStatsWidget(
        :coopname='info.coopname',
        :username='username',
        :expanded='expandedProjects',
        @toggle-expand='handleProjectToggleExpand',
        @project-click='handleProjectClick',
        @data-loaded='handleProjectsDataLoaded'
      )
        template(#project-content='{ project }')
          TimeIssuesWidget(
            :project-hash='project.project_hash',
            :coopname='info.coopname',
            :username='username',
            :expanded='expandedIssues',
            @toggle-expand='handleIssueToggleExpand',
            @issue-click='handleIssueClick',
            @data-loaded='handleIssuesDataLoaded'
          )
            template(#issue-content='{ issue }')
              TimeEntriesWidget(
                :issue-hash='issue.issue_hash',
                :coopname='info.coopname',
                :username='username'
              )
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session/model/store';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { TimeStatsWidget, TimeIssuesWidget, TimeEntriesWidget } from 'app/extensions/capital/widgets';

const { info } = useSystemStore();
const { username } = useSessionStore();

// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_tracker_projects_expanded';
const ISSUES_EXPANDED_KEY = 'capital_tracker_issues_expanded';

// Управление развернутостью проектов
const {
  expanded: expandedProjects,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью задач
const {
  expanded: expandedIssues,
  loadExpandedState: loadIssuesExpandedState,
  cleanupExpandedByKeys: cleanupIssuesExpanded,
  toggleExpanded: toggleIssueExpanded,
} = useExpandableState(ISSUES_EXPANDED_KEY);

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleIssueToggleExpand = (issueHash: string) => {
  toggleIssueExpanded(issueHash);
};

const handleProjectsDataLoaded = (projectHashes: string[]) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);
};

const handleIssuesDataLoaded = (issueHashes: string[]) => {
  // Очищаем устаревшие записи expanded задач после загрузки данных
  cleanupIssuesExpanded(issueHashes);
};

const handleIssueClick = (issueHash: string) => {
  // Клик на строку задачи приводит к развороту/свертыванию
  toggleIssueExpanded(issueHash);
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadIssuesExpandedState();

});
</script>
