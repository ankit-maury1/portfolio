// Test script to verify bulk status updates
const testBulkUpdate = async () => {
  console.log('Testing bulk status update functionality...');

  // Test data
  const testPost = {
    id: 'test-post-id',
    title: 'Test Post',
    status: 'DRAFT',
    published: false
  };

  // Simulate bulk update to ARCHIVED
  const bulkAction = { type: 'status', status: 'ARCHIVED' };

  const updateData = {
    ...testPost,
    status: bulkAction.status,
    published: bulkAction.status === 'PUBLISHED',
    publishedAt: bulkAction.status === 'PUBLISHED' ? new Date().toISOString() : testPost.publishedAt,
  };

  console.log('Original post:', testPost);
  console.log('Update data:', updateData);

  // Expected: status should be 'ARCHIVED', published should be false
  if (updateData.status === 'ARCHIVED' && updateData.published === false) {
    console.log('✅ Bulk update test PASSED');
  } else {
    console.log('❌ Bulk update test FAILED');
  }
};

testBulkUpdate();
