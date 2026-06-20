SET FOREIGN_KEY_CHECKS = 0;

-- Data for phases
INSERT INTO `phases` (`id`, `name`) VALUES (12, 'Fase de grupos');

-- Data for groups
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (3, 'Grupo K', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (4, 'Grupo A', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (5, 'Grupo B', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (6, 'Grupos C', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (7, 'Grupo D', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (8, 'Grupo E', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (9, 'Grupo F', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (10, 'Grupo G', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (11, 'Grupo H', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (12, 'Grupo I', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (13, 'Grupo J', 12);
INSERT INTO `groups` (`id`, `name`, `phase_id`) VALUES (14, 'Grupo L', 12);

-- Data for teams
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (3, 'Uzbekistan', 'https://flagcdn.com / w20 / ua . png', 3);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (4, 'Colombia', '', 3);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (5, 'Canadá', '', 5);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (6, 'EE.UU.', '', 7);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (7, 'Mexico', '', 4);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (8, 'Alemania', '', 8);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (9, 'Arabia Saudí', '', 11);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (10, 'Argelia', '', 13);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (11, 'Argentina', '', 13);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (12, 'Australia', '', 7);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (13, 'Austria', '', 13);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (14, 'Bélgica', '', 10);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (15, 'Bosnia y Herzegovina', '', 5);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (16, 'Brasil', '', 6);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (17, 'Catar', '', 5);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (18, 'Chequia', '', 4);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (19, 'Costa de Marfil', '', 8);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (20, 'Croacia', '', 14);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (21, 'Curazao', '', 8);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (22, 'Ecuador', '', 8);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (23, 'Egipto', '', 10);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (24, 'Escocia', '', 6);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (25, 'España', '', 11);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (26, 'Francia', '', 12);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (27, 'Ghana', '', 14);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (28, 'Haití', '', 6);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (29, 'Inglaterra', '', 14);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (30, 'Irak', '', 12);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (31, 'Islas de Cabo Verde', '', 11);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (32, 'Japon', '', 9);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (33, 'Jordania', '', 13);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (34, 'Marruecos', '', 6);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (35, 'Noruega', '', 12);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (36, 'Nueva Zelanda', '', 10);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (37, 'Paises bajos', '', 9);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (38, 'Panamá', '', 14);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (39, 'Paraguay', '', 7);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (40, 'Portugal', '', 3);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (41, 'RD Congo', '', 3);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (42, 'Republica de Corea', '', 4);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (43, 'RI de Iran', '', 10);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (44, 'Senegal', '', 12);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (45, 'Sudafrica', '', 4);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (46, 'Suecia', '', 9);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (47, 'Suiza', '', 5);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (48, 'Túnez', '', 9);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (49, 'Turquia', '', 7);
INSERT INTO `teams` (`id`, `name`, `flag_url`, `group_id`) VALUES (50, 'Uruguay', '', 11);

-- Data for matches
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (13, 3, 4, 12, '2026-06-18T19:21:00', 'm', NULL, NULL, 'SCHEDULED');
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (14, 5, 17, 12, '2026-06-18T13:12:00', 'place vancouver', 6, 0, 'FINISHED');
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (15, 47, 15, 12, '2026-06-18T15:13:00', 'm', 4, 1, 'FINISHED');
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (16, 18, 45, 12, '2026-06-18T18:14:00', 'm', 1, 1, 'FINISHED');
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (17, 7, 42, 12, '2026-06-18T21:15:00', 'm', NULL, NULL, 'SCHEDULED');
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `phase_id`, `date`, `stadium`, `home_score`, `away_score`, `status`) VALUES (18, 27, 38, 12, '2026-06-17T13:20:00', 'k', 1, 0, 'FINISHED');

-- Data for users
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (1, 'admin', 'admin@polla.com', '$2b$12$7TXr3qroHz6K4LIzn58dWu6FQE9T4ZyybKRHMj5s.lG.vlhkAx9ji', 1);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (2, 'fsolano', 'felix.solano.marquez@gmail.com', '$2b$12$6BI2V09KWKYy5o7JFt0cO.kE6CuiKrJGtKL/lqSbLoRADjrUH00Hu', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (3, 'jonate', 'jonate@jonate.com', '$2b$12$Vp2zDMvJPlm41MaNzdv5geWa4XtswQlDOYXyM9tZkG6VgurECDc26', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (4, 'ldiaz', 'ldiaz@ldiaz.com', '$2b$12$xgr6KRU8UPeUm8CK0DiIR.nLrjkjeBqjvnqkJH9U5LXm0lbQ0HR86', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (5, 'dteheran', 'dteheran@dteheran.com', '$2b$12$54cPL8z6GLl.qQNCqv45DeqG0S99JAzRbdn62zZVjzkYc03FlK6Di', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (6, 'oflorez', 'oflorez@oflorez.com', '$2b$12$m8hJiEIMao.px93tFsaCC.TlTh9cActqH3dz1aUB4c78kahfQBOu6', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (7, 'jorozco', 'jorozco@jorozco.com', '$2b$12$/6.AM69U4CfTTR6bbu2i4usay6S/EpCx3BztpDC4uevI1AYiEUwLm', 0);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `is_admin`) VALUES (8, 'ppalacio', 'ppalacio@ppalacio.com', '$2b$12$I1Vo8l3Xm8GelQc01csEiuNBsE8HocUvAjNeXBN9KjB3pCFjHlVwm', 0);

-- Data for predictions
INSERT INTO `predictions` (`id`, `user_id`, `match_id`, `home_prediction`, `away_prediction`, `points_earned`) VALUES (1, 1, 13, 1, 3, 0);
INSERT INTO `predictions` (`id`, `user_id`, `match_id`, `home_prediction`, `away_prediction`, `points_earned`) VALUES (2, 2, 17, 2, 1, 0);
INSERT INTO `predictions` (`id`, `user_id`, `match_id`, `home_prediction`, `away_prediction`, `points_earned`) VALUES (3, 2, 18, 1, 0, 5);

SET FOREIGN_KEY_CHECKS = 1;
