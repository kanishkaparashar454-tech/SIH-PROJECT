-- Demo data for SIH PS 26002 (run once for the initial demo dataset)
INSERT INTO districts (name,state,centroid) VALUES
 ('Imphal East','Manipur',ST_SetSRID(ST_MakePoint(94.05,24.82),4326)),
 ('East Sikkim','Sikkim',ST_SetSRID(ST_MakePoint(88.62,27.33),4326)),
 ('Tawang','Arunachal Pradesh',ST_SetSRID(ST_MakePoint(92.67,27.59),4326))
ON CONFLICT DO NOTHING;
INSERT INTO roads (name,district_id,status,geom,base_risk,estimated_delay_minutes) VALUES
 ('NH-102 Imphal-Moreh',1,'open',ST_SetSRID(ST_MakeLine(ST_MakePoint(94.00,24.80),ST_MakePoint(94.20,24.70)),4326),20,15),
 ('NH-10 Gangtok Corridor',2,'at-risk',ST_SetSRID(ST_MakeLine(ST_MakePoint(88.55,27.32),ST_MakePoint(88.75,27.35)),4326),45,40),
 ('Tawang-Bomdila Highway',3,'open',ST_SetSRID(ST_MakeLine(ST_MakePoint(92.67,27.59),ST_MakePoint(92.42,27.26)),4326),30,25)
ON CONFLICT DO NOTHING;
INSERT INTO vehicles (truck_code,cargo_type,status,current_location,last_seen) VALUES
 ('NER-MED-001','Medicines','active',ST_SetSRID(ST_MakePoint(94.05,24.82),4326),NOW()),
 ('NER-FOOD-002','Food supplies','active',ST_SetSRID(ST_MakePoint(88.62,27.33),4326),NOW()),
 ('NER-BLD-003','Construction material','delayed',ST_SetSRID(ST_MakePoint(92.67,27.59),4326),NOW())
ON CONFLICT (truck_code) DO NOTHING;
