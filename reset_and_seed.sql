-- 1. Reset tables
TRUNCATE TABLE student_users RESTART IDENTITY CASCADE;

-- 2. Insert fresh test accounts
INSERT INTO student_users (
  first_name, last_name, email, phone, city, school_name, level, section, pack_category, badge_label, group_name, status, created_at
) VALUES 
  ('Fedi', 'Ben Amor', 'fedi.freemium@azed.info', '21698123456', 'Tunis', 'Lycée Pilote Tunis', '4ème', 'Sciences de l''Informatique', 'Freemium', 'Option Gratuit', 'Non assigné', 'Actif', NOW()),
  ('Yasmine', 'Mansour', 'yasmine.premium@azed.info', '21697234567', 'Sousse', 'Lycée Garçons Sousse', '3ème', 'Sciences de l''Informatique', 'Premium', 'Pack Premium', 'Groupe A', 'Actif', NOW()),
  ('Amine', 'Shraib', 'amine.premiumplus@azed.info', '21695345678', 'Sousse', 'Lycée Pilote Sousse', '4ème', 'Sciences de l''Informatique', 'Premium+', 'Pack Premium+', 'Groupe B', 'Actif', NOW()),
  ('Salma', 'Rebik', 'salma.premiumplusplus@azed.info', '21692456789', 'Sfax', 'Lycée de Filles Sfax', '3ème', 'Sciences de l''Informatique', 'Premium++', 'Pack Premium++', 'Groupe A', 'Actif', NOW()),
  ('Khalil', 'Ben Romdhane', 'khalil.pending@azed.info', '21696567890', 'Sfax', 'Lycée Pilote Sfax', '4ème', 'Sciences de l''Informatique', 'Freemium', 'Option Gratuit', 'Non assigné', 'En attente', NOW());
