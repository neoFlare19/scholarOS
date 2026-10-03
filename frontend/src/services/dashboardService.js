import { apiRequest } from "../utils/api.js";

/**
 * ScholarOS Dashboard API Service
 * Centralizes all dashboard-related API calls to backend endpoints.
 */

// ============================================================================
// DASHBOARD OVERVIEW & STATS
// ============================================================================

/**
 * Get dashboard statistics for the authenticated user
 * GET /api/v1/dashboard/stats
 */
export async function getDashboardStats() {
  return await apiRequest("/v1/dashboard/stats");
}

/**
 * Get recent activities and recent notifications combined
 * GET /api/v1/dashboard/recent-activity
 */
export async function getRecentActivity() {
  return await apiRequest("/v1/dashboard/recent-activity");
}

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * Get all projects for the authenticated user
 * GET /api/v1/dashboard/projects
 */
export async function getDashboardProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.research_area_id) query.append("research_area_id", params.research_area_id);
  if (params.search) query.append("search", params.search);
  if (params.per_page) query.append("per_page", params.per_page);
  if (params.page) query.append("page", params.page);

  const queryString = query.toString();
  const endpoint = `/v1/dashboard/projects${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint);
}

/**
 * Get a single project by ID
 * GET /api/v1/dashboard/projects/{id}
 */
export async function getProjectDetails(id) {
  return await apiRequest(`/v1/dashboard/projects/${id}`);
}

/**
 * Create a new project
 * POST /api/v1/projects
 */
export async function createProject(projectData) {
  return await apiRequest("/v1/projects", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
}

/**
 * Update an existing project
 * PUT /api/v1/projects/{id}
 */
export async function updateProject(projectId, projectData) {
  return await apiRequest(`/v1/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(projectData),
  });
}

/**
 * Delete a project
 * DELETE /api/v1/projects/{id}
 */
export async function deleteProject(projectId) {
  return await apiRequest(`/v1/projects/${projectId}`, {
    method: "DELETE",
  });
}

/**
 * Get files for a specific project
 * GET /api/v1/projects/{projectId}/files
 */
export async function getProjectFiles(projectId) {
  return await apiRequest(`/v1/projects/${projectId}/files`);
}

/**
 * Get milestones for a specific project
 * GET /api/v1/projects/{projectId}/milestones
 */
export async function getProjectMilestones(projectId) {
  return await apiRequest(`/v1/projects/${projectId}/milestones`);
}

/**
 * Get tasks for a specific project
 * GET /api/v1/projects/{projectId}/tasks
 */
export async function getProjectTasks(projectId) {
  return await apiRequest(`/v1/projects/${projectId}/tasks`);
}

/**
 * Get members for a specific project
 * GET /api/v1/projects/{projectId}/members
 */
export async function getProjectMembers(projectId) {
  return await apiRequest(`/v1/projects/${projectId}/members`);
}

/**
 * Add a member to a project
 * POST /api/v1/projects/{projectId}/members
 */
export async function addProjectMember(projectId, memberData) {
  return await apiRequest(`/v1/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify(memberData),
  });
}

/**
 * Remove a member from a project
 * DELETE /api/v1/projects/{projectId}/members/{memberId}
 */
export async function removeProjectMember(projectId, memberId) {
  return await apiRequest(`/v1/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
  });
}

/**
 * Get all research areas
 * GET /api/v1/research-areas
 */
export async function getResearchAreas() {
  return await apiRequest("/v1/research-areas");
}

/**
 * Update task status
 * PATCH /api/v1/projects/{projectId}/tasks/{taskId}/status
 */
export async function updateTaskStatus(projectId, taskId, status) {
  return await apiRequest(`/v1/projects/${projectId}/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// RESEARCH PAPERS
// ============================================================================

/**
 * Get research papers for authenticated user
 * GET /api/v1/dashboard/papers
 */
export async function getDashboardPapers(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.category_id) query.append("category_id", params.category_id);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page);

  const queryString = query.toString();
  const endpoint = `/v1/dashboard/papers${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint);
}

/**
 * Get paper statistics
 * GET /api/v1/dashboard/papers/stats
 */
export async function getPaperStats() {
  return await apiRequest("/v1/dashboard/papers/stats");
}

/**
 * Search Google Scholar for external research papers
 * GET /api/v1/papers/scholar-search
 */
export async function searchGoogleScholarPapers(query, limit = 20) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return await apiRequest(`/v1/papers/scholar-search?${params}`);
}

/**
 * Get Scholar recommendations for the authenticated user's selected interests
 * GET /api/v1/papers/recommendations
 */
export async function getGoogleScholarRecommendations() {
  return await apiRequest("/v1/papers/recommendations");
}

// ============================================================================
// RESEARCHERS DIRECTORY
// ============================================================================

/**
 * Get researcher directory with filters
 * GET /api/v1/dashboard/researchers
 */
export async function getDashboardResearchers(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.role) query.append("role", params.role);
  if (params.department_id) query.append("department_id", params.department_id);
  if (params.page) query.append("page", params.page);

  const queryString = query.toString();
  const endpoint = `/v1/dashboard/researchers${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint);
}

/**
 * Get single researcher profile details
 * GET /api/v1/dashboard/researchers/{id}
 */
export async function getResearcherDetails(id) {
  return await apiRequest(`/v1/dashboard/researchers/${id}`);
}

/**
 * Autocomplete search for researchers
 * GET /api/v1/dashboard/researchers/search
 */
export async function searchResearchers(searchQuery) {
  return await apiRequest(`/v1/dashboard/researchers/search?query=${encodeURIComponent(searchQuery)}`);
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get notifications for authenticated user
 * GET /api/v1/dashboard/notifications
 */
export async function getNotifications(params = {}) {
  const query = new URLSearchParams();
  if (params.filter) query.append("filter", params.filter);
  if (params.page) query.append("page", params.page);

  const queryString = query.toString();
  const endpoint = `/v1/dashboard/notifications${queryString ? `?${queryString}` : ""}`;
  return await apiRequest(endpoint);
}

/**
 * Get notification counts
 * GET /api/v1/dashboard/notifications/count
 */
export async function getNotificationCount() {
  return await apiRequest("/v1/dashboard/notifications/count");
}

/**
 * Mark a notification as read
 * PUT /api/v1/dashboard/notifications/{id}/read
 */
export async function markNotificationAsRead(id) {
  return await apiRequest(`/v1/dashboard/notifications/${id}/read`, {
    method: "PUT",
  });
}

/**
 * Mark all notifications as read
 * PUT /api/v1/dashboard/notifications/mark-all-read
 */
export async function markAllNotificationsAsRead() {
  return await apiRequest("/v1/dashboard/notifications/mark-all-read", {
    method: "PUT",
  });
}

/**
 * Delete a notification
 * DELETE /api/v1/dashboard/notifications/{id}
 */
export async function deleteNotification(id) {
  return await apiRequest(`/v1/dashboard/notifications/${id}`, {
    method: "DELETE",
  });
}

// ============================================================================
// AUTHENTICATED USER
// ============================================================================

/**
 * Get current authenticated user details
 * GET /api/v1/user
 */
export async function getCurrentUser() {
  return await apiRequest("/v1/user");
}
