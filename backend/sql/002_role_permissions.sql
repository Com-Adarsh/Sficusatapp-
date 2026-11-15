INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN(
'profile.read','profile.update','department.create','cbt.create','cbt.manage','cbt.publish','cbt.question.manage','cbt.results.read','cbt.results.export',
'aashraya.request.create','sahayi.request.create','scholarx.submit','helpdesk.ticket.create')
WHERE r.name='student' ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN('profile.read','profile.update','department.create','cbt.create','cbt.manage','cbt.publish','cbt.question.manage','cbt.results.read','cbt.results.export')
WHERE r.name='department_coordinator' ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN('aashraya.manage','sahayi.manage','samskara.manage','scholarx.manage','helpdesk.manage','department.manage')
WHERE r.name='module_coordinator' ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN('department.manage','cbt.manage','cbt.results.read','cbt.results.export','scholarx.manage','helpdesk.manage','aashraya.manage','sahayi.manage','samskara.manage')
WHERE r.name='moderator' ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN('department.manage','cbt.manage','cbt.results.read','cbt.results.export','scholarx.manage','helpdesk.manage','aashraya.manage','sahayi.manage','samskara.manage','admin.manage')
WHERE r.name='admin' ON CONFLICT DO NOTHING;
