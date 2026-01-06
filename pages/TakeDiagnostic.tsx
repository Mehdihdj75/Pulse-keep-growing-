import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, Loader2, AlertTriangle, Info, ArrowLeft, ChevronDown } from 'lucide-react';
import { sendToN8N, buildN8NPayload, Answer } from '../services/n8nService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Nouveaux types pour le questionnaire flexible
type QuestionType = 'scale' | 'select' | 'multiselect';

interface QuestionDef {
    code: string;
    text: string;
    type: QuestionType;
    options?: string[]; // Pour select/multiselect
}

interface RubricDef {
    titre: string;
    questions: QuestionDef[];
}

interface SectionDef {
    titre: string;
    rubriques: RubricDef[];
}

const DETAILED_QUESTIONNAIRE: { id: string; name: string; sections: SectionDef[] } = {
    id: 'Pulse-Sales-v2', // Keep existing ID or update if needed
    name: 'Diagnostic Commercial Pulse',
    sections: [
        {
            "titre": "Vision formation et excellence pédagogique",
            "rubriques": [
                {
                    "titre": "Vision pédagogique : qui on veut être pour nos apprenants",
                    "questions": [
                        {
                            "code": "Q_84351",
                            "text": "Votre équipe comprend-elle clairement la vision et la mission de Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_88508",
                            "text": "Les objectifs d'excellence pédagogique sont-ils bien communiqués à vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_68047",
                            "text": "Vos collaborateurs savent-ils comment leur rôle contribue à la montée en compétences des opticiens ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_64551",
                            "text": "Votre équipe comprend-elle l'importance de Formatech dans la stratégie CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_9159",
                            "text": "Les valeurs pédagogiques sont-elles clairement définies et partagées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_75020",
                            "text": "Vos collaborateurs connaissent-ils les standards de qualité attendus dans les formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_79086",
                            "text": "Comprenez-vous clairement la vision et la mission de l'équipe Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_3027",
                            "text": "Les objectifs d'excellence pédagogique et de satisfaction apprenants vous sont-ils bien communiqués ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4782",
                            "text": "Savez-vous comment votre rôle contribue à la montée en compétences des opticiens ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85121",
                            "text": "Comprenez-vous l'importance de Formatech dans la stratégie CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_45719",
                            "text": "Les valeurs pédagogiques sont-elles clairement définies dans votre équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_39007",
                            "text": "Connaissez-vous les standards de qualité attendus dans vos formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Stratégie formation : quels contenus, quelles modalités, quelle expérience",
                    "questions": [
                        {
                            "code": "Q_79843",
                            "text": "Vos équipes connaissent-elles les différents publics formés (réseau Krys, indépendants, équipes internes) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_12948",
                            "text": "Vos collaborateurs comprennent-ils les besoins spécifiques selon les profils d'apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_25470",
                            "text": "Votre équipe maîtrise-t-elle les modalités pédagogiques (présentiel, distanciel, mixte) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_22015",
                            "text": "Vos collaborateurs comprennent-ils la stratégie de déploiement des formations produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_80249",
                            "text": "Votre équipe sait-elle adapter les contenus selon les catalogues (CODIR, Partners, Signature) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_65447",
                            "text": "Vos formateurs maîtrisent-ils l'approche pédagogique pour verres et contactologie ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_32683",
                            "text": "Connaissez-vous les différents publics formés (réseau Krys, indépendants, équipes internes) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51056",
                            "text": "Comprenez-vous les besoins spécifiques de formation selon les profils d'apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_53096",
                            "text": "Maîtrisez-vous les modalités pédagogiques (présentiel, distanciel, mixte) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_27856",
                            "text": "Comprenez-vous la stratégie de déploiement des formations produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_12857",
                            "text": "Savez-vous adapter vos contenus selon les catalogues (CODIR, Partners, Signature) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_89632",
                            "text": "Maîtrisez-vous l'approche pédagogique pour les formations verres et contactologie ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Valeurs et culture formation : ADN pédagogique, notre approche, notre identité",
                    "questions": [
                        {
                            "code": "Q_51838",
                            "text": "Vos équipes connaissent-elles les valeurs fondamentales de l'approche pédagogique Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_33605",
                            "text": "Vos collaborateurs comprennent-ils comment ces valeurs influencent leurs pratiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_23838",
                            "text": "Votre équipe sait-elle articuler l'ADN pédagogique de Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_65115",
                            "text": "Vos collaborateurs comprennent-ils l'approche CODIR d'accompagnement des opticiens ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_77929",
                            "text": "Votre équipe maîtrise-t-elle le discours de présentation de l'offre formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_91734",
                            "text": "Connaissez-vous les valeurs fondamentales de l'approche pédagogique Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_83369",
                            "text": "Comprenez-vous comment ces valeurs influencent vos pratiques de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_18956",
                            "text": "Savez-vous articuler l'ADN pédagogique de l'équipe Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_12527",
                            "text": "Comprenez-vous l'approche CODIR de l'accompagnement des opticiens ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_67231",
                            "text": "Maîtrisez-vous le discours de présentation de l'offre formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Plan d'exécution formation, KPI / OKR / Priorités pédagogiques",
                    "questions": [
                        {
                            "code": "Q_67681",
                            "text": "Vos collaborateurs connaissent-ils leurs objectifs individuels de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_64929",
                            "text": "Organisez-vous régulièrement des points d'avancement des objectifs formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_19660",
                            "text": "Vos équipes comprennent-elles comment leurs KPI s'alignent avec ceux de l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4424",
                            "text": "Votre équipe maîtrise-t-elle les indicateurs de performance formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84031",
                            "text": "Vos collaborateurs connaissent-ils les objectifs de satisfaction des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_50125",
                            "text": "Votre équipe comprend-elle les enjeux des lancements de nouveaux produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92317",
                            "text": "Connaissez-vous vos objectifs individuels de formation et d'accompagnement ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_95206",
                            "text": "Participez-vous régulièrement aux points d'avancement des objectifs formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_75932",
                            "text": "Comprenez-vous comment vos KPI s'alignent avec ceux de l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_81600",
                            "text": "Maîtrisez-vous les indicateurs de performance de votre activité formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_71040",
                            "text": "Connaissez-vous les objectifs de satisfaction des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21549",
                            "text": "Comprenez-vous les enjeux des lancements de nouveaux produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Des équipes alignées et expertes en transmission de savoir",
            "rubriques": [
                {
                    "titre": "Composition et diversité de l'équipe Formatech",
                    "questions": [
                        {
                            "code": "Q_76744",
                            "text": "Favorisez-vous l'efficacité de la collaboration entre vos 5 collaborateurs ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4339",
                            "text": "Votre équipe de 6 personnes tire-t-elle parti de la diversité des expertises ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_8385",
                            "text": "Optimisez-vous la complémentarité des compétences spécialisées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4657",
                            "text": "La diversité des approches pédagogiques enrichit-elle la qualité sous votre management ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_2200",
                            "text": "Votre équipe valorise-t-elle les différentes expériences terrain et techniques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_91694",
                            "text": "Travaillez-vous efficacement avec vos 5 collègues aux profils complémentaires ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_15897",
                            "text": "Les compétences spécialisées (verres, contactologie, bien-être visuel) se complètent-elles bien ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92694",
                            "text": "La diversité des approches pédagogiques enrichit-elle la qualité des formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_52833",
                            "text": "L'équipe valorise-t-elle les différentes expériences terrain et techniques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Contribution et apports respectifs : Rôles et responsabilités formation",
                    "questions": [
                        {
                            "code": "Q_22972",
                            "text": "Les rôles et responsabilités sont-ils clairement définis dans votre équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_11191",
                            "text": "Les rôles entre formateurs spécialisés et expert bien-être visuel sont-ils bien définis ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_90037",
                            "text": "Votre rôle de responsable est-il clair et bien compris ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_66430",
                            "text": "Optimisez-vous la répartition des formations selon les expertises ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21117",
                            "text": "Les responsabilités de suivi post-formation sont-elles claires pour tous ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_1360",
                            "text": "La répartition formations externes (95%) / internes (5%) est-elle bien gérée ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_56031",
                            "text": "Connaissez-vous clairement votre rôle et vos responsabilités dans l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34093",
                            "text": "Comprenez-vous le rôle de Carine Tournier dans l'organisation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_9578",
                            "text": "Savez-vous comment répartir les formations selon les expertises de chacun ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_2115",
                            "text": "Les responsabilités de suivi post-formation sont-elles claires ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34252",
                            "text": "La répartition entre formations externes (95%) et internes (5%) est-elle maîtrisée ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Collaboration inter-services et avec les clients externes",
                    "questions": [
                        {
                            "code": "Q_81778",
                            "text": "Vos équipes collaborent-elles efficacement avec les autres services CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_3670",
                            "text": "Favorisez-vous la collaboration avec les équipes commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_50240",
                            "text": "La collaboration avec le service client pour les montées en compétences est-elle fluide ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_36877",
                            "text": "Coordonnez-vous efficacement avec le marketing pour les lancements produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_60391",
                            "text": "La relation avec les opticiens clients est-elle bien gérée par vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_71941",
                            "text": "Vos collaborateurs partagent-ils efficacement les retours terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_77509",
                            "text": "Collaborez-vous efficacement avec les autres services CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_65963",
                            "text": "Travaillez-vous bien avec les équipes commerciales pour identifier les besoins formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_6428",
                            "text": "Échangez-vous efficacement avec le marketing pour les lancements produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_38830",
                            "text": "La relation avec les opticiens clients est-elle bien gérée et suivie ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_14990",
                            "text": "Partagez-vous efficacement les retours terrain avec les équipes internes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Des processus optimisés pour la formation et l'accompagnement",
            "rubriques": [
                {
                    "titre": "Organisation de l'équipe Formatech",
                    "questions": [
                        {
                            "code": "Q_36946",
                            "text": "L'organisation de votre équipe de 6 personnes est-elle optimale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_83396",
                            "text": "La répartition des responsabilités entre spécialités est-elle efficace ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_35067",
                            "text": "Votre organisation permet-elle une bonne réactivité face aux demandes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_35836",
                            "text": "La structure favorise-t-elle la collaboration et le partage d'expertise ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_54670",
                            "text": "Adaptez-vous l'organisation selon les besoins des clients et du business ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_25511",
                            "text": "L'organisation de votre équipe de 6 personnes est-elle claire et efficace ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_57970",
                            "text": "La répartition des responsabilités entre les spécialités est-elle optimale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_32314",
                            "text": "L'organisation permet-elle une bonne réactivité face aux demandes de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84402",
                            "text": "L'organisation évolue-t-elle selon les besoins des clients et du business ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Processus de conception et délivrance des formations",
                    "questions": [
                        {
                            "code": "Q_35281",
                            "text": "Les processus de conception des formations sont-ils efficaces sous votre supervision ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84912",
                            "text": "Les procédures de délivrance des formations sont-elles optimisées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_90633",
                            "text": "Le processus de suivi post-formation fonctionne-t-il bien ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96919",
                            "text": "Les processus garantissent-ils la qualité pédagogique attendue ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_41514",
                            "text": "L'identification des besoins de formation est-elle bien structurée ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_55001",
                            "text": "Pratiquez-vous l'amélioration continue des processus de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_17888",
                            "text": "Les processus de conception des formations sont-ils efficaces ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_45653",
                            "text": "Les procédures de délivrance des formations (présentiel/distanciel) sont-elles optimisées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_90327",
                            "text": "Les processus garantissent-ils la qualité pédagogique ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_75713",
                            "text": "Les processus d'amélioration continue des formations sont-ils pratiqués ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Outils et systèmes de formation (présentiel/distanciel)",
                    "questions": [
                        {
                            "code": "Q_95568",
                            "text": "Vos équipes maîtrisent-elles les outils de formation à distance ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_65817",
                            "text": "Les systèmes de gestion des formations répondent-ils aux besoins ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_82834",
                            "text": "Les outils facilitent-ils le suivi des apprenants par vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_46924",
                            "text": "Vos collaborateurs disposent-ils des informations produits nécessaires ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_49317",
                            "text": "Les outils permettent-ils des formations efficaces en présentiel et distanciel ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_8945",
                            "text": "L'accès aux catalogues et documentations techniques est-il optimal ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_22684",
                            "text": "Maîtrisez-vous les outils de formation à distance nécessaires ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_33813",
                            "text": "Les systèmes de gestion des formations répondent-ils à vos besoins ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_3048",
                            "text": "Les outils facilitent-ils le suivi des apprenants et de leur progression ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_78573",
                            "text": "Disposez-vous des informations produits nécessaires pour bien former ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_98554",
                            "text": "L'accès aux catalogues et documentations techniques est-il fluide ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Suivi et évaluation de l'efficacité des formations",
                    "questions": [
                        {
                            "code": "Q_52239",
                            "text": "Mesurez-vous régulièrement les indicateurs d'efficacité des formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_32170",
                            "text": "Donnez-vous un feedback régulier à vos équipes sur la qualité des formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_48649",
                            "text": "Les performances de formation sont-elles suivies et analysées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_93422",
                            "text": "Partagez-vous les résultats de satisfaction des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_95787",
                            "text": "Vos équipes participent-elles à l'analyse des indicateurs de performance ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_29985",
                            "text": "Le suivi vous permet-il d'identifier les axes d'amélioration pédagogique ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_30535",
                            "text": "Les indicateurs d'efficacité des formations sont-ils régulièrement mesurés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_10921",
                            "text": "Recevez-vous un feedback régulier sur la qualité de vos formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_55484",
                            "text": "Les résultats de satisfaction des apprenants sont-ils partagés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_43142",
                            "text": "Participez-vous à l'analyse des indicateurs de performance formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51782",
                            "text": "Le suivi permet-il d'identifier les axes d'amélioration pédagogique ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Compétences en ingénierie pédagogique et expertise produits",
                    "questions": [
                        {
                            "code": "Q_90852",
                            "text": "Développez-vous les compétences en ingénierie pédagogique de vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_99391",
                            "text": "Vos collaborateurs maîtrisent-ils les techniques d'animation et de transmission ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_3370",
                            "text": "L'expertise produits de votre équipe est-elle maintenue à jour ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_62317",
                            "text": "Vos formateurs connaissent-ils suffisamment les catalogues CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_43269",
                            "text": "Encouragez-vous le développement des compétences sur les nouvelles modalités ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96079",
                            "text": "Vos équipes maîtrisent-elles l'adaptation aux différents profils d'apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_93343",
                            "text": "Développez-vous régulièrement vos compétences en ingénierie pédagogique ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_50290",
                            "text": "Maîtrisez-vous les techniques d'animation et de transmission de savoir ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_44274",
                            "text": "Votre expertise produits (verres/contactologie) est-elle à jour ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_54897",
                            "text": "Connaissez-vous suffisamment les catalogues CODIR pour bien former ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21747",
                            "text": "Développez-vous vos compétences sur les nouvelles modalités pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_95688",
                            "text": "Maîtrisez-vous les techniques d'adaptation aux différents profils d'apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Des comportements exemplaires dans l'accompagnement pédagogique",
            "rubriques": [
                {
                    "titre": "Confiance et Respect dans la relation apprenant",
                    "questions": [
                        {
                            "code": "Q_26382",
                            "text": "La confiance règne-t-elle entre vos collaborateurs formateurs ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85644",
                            "text": "Vos collaborateurs partagent-ils efficacement leurs connaissances ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_87538",
                            "text": "Le respect mutuel caractérise-t-il les relations dans vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_64765",
                            "text": "Vos collaborateurs expriment-ils librement leurs idées d'amélioration ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_344",
                            "text": "La confiance règne-t-elle dans vos relations avec les apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_37967",
                            "text": "Vos équipes traitent-elles tous les apprenants avec le même respect ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_11318",
                            "text": "Faites-vous confiance à vos collègues formateurs dans leur expertise ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34046",
                            "text": "Vos collègues peuvent-ils compter sur vous pour partager vos connaissances ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_27675",
                            "text": "Le respect mutuel caractérise-t-il les relations dans votre équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_19752",
                            "text": "Exprimez-vous librement vos idées pour améliorer les formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_7811",
                            "text": "Traitez-vous tous les apprenants avec le même niveau de respect ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Adaptation pédagogique et gestion des difficultés d'apprentissage",
                    "questions": [
                        {
                            "code": "Q_23080",
                            "text": "Vos formateurs adaptent-ils leur pédagogie aux difficultés spécifiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_22077",
                            "text": "Vos collaborateurs écoutent-ils activement les besoins des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_86060",
                            "text": "Vos équipes cherchent-elles systématiquement des solutions face aux difficultés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_74304",
                            "text": "Vos formateurs transforment-ils les erreurs en opportunités d'apprentissage ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_90170",
                            "text": "Vos collaborateurs ajustent-ils leurs méthodes selon les retours ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_66477",
                            "text": "Votre équipe apprend-elle de ses expériences pour améliorer les formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_88118",
                            "text": "Adaptez-vous votre pédagogie aux difficultés d'apprentissage spécifiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_17770",
                            "text": "Écoutez-vous activement les besoins et questions des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_57556",
                            "text": "Cherchez-vous systématiquement des solutions face aux difficultés de compréhension ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_579",
                            "text": "Transformez-vous les erreurs en opportunités d'apprentissage ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_6175",
                            "text": "Ajustez-vous vos méthodes selon les retours des apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Engagement et passion pour la transmission de savoir",
                    "questions": [
                        {
                            "code": "Q_64098",
                            "text": "Vos collaborateurs font-ils preuve de passion dans la transmission ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_47389",
                            "text": "L'engagement pour la réussite des apprenants est-il fort dans vos équipes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_99270",
                            "text": "Votre équipe se mobilise-t-elle pour atteindre les objectifs de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_9231",
                            "text": "Chacun contribue-t-il au succès collectif des formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_50364",
                            "text": "La passion pour la formation transparaît-elle dans les interventions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_43798",
                            "text": "Vos collaborateurs partagent-ils spontanément leurs bonnes pratiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_20939",
                            "text": "Faites-vous preuve de passion dans la transmission de vos connaissances ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_88303",
                            "text": "Votre engagement pour la réussite des apprenants est-il fort ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_753",
                            "text": "L'équipe se mobilise-t-elle pour atteindre les objectifs de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_10837",
                            "text": "Votre passion pour la formation transparaît-elle dans vos interventions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_13523",
                            "text": "Partagez-vous spontanément vos bonnes pratiques pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Ethique et Intégrité dans l'accompagnement formation",
                    "questions": [
                        {
                            "code": "Q_8387",
                            "text": "Vos collaborateurs agissent-ils toujours dans l'intérêt de l'apprenant ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_66865",
                            "text": "Vos équipes respectent-elles scrupuleusement la confidentialité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_17646",
                            "text": "Les pratiques pédagogiques sont-elles conformes aux standards ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_77915",
                            "text": "Vos formateurs font-ils preuve d'honnêteté dans l'évaluation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_60841",
                            "text": "Vos collaborateurs respectent-ils leurs engagements envers les apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85085",
                            "text": "Vos équipes assument-elles pleinement leurs responsabilités de formateurs ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_44379",
                            "text": "Agissez-vous toujours dans l'intérêt de l'apprenant et de l'entreprise ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_56102",
                            "text": "Respectez-vous scrupuleusement la confidentialité des informations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_53871",
                            "text": "Vos pratiques pédagogiques sont-elles toujours conformes aux standards ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_16740",
                            "text": "Faites-vous preuve d'honnêteté dans l'évaluation des compétences ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_98415",
                            "text": "Respectez-vous vos engagements envers les apprenants ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_79768",
                            "text": "Assumez-vous pleinement vos responsabilités de formateur ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Innovation pédagogique et amélioration continue",
                    "questions": [
                        {
                            "code": "Q_55982",
                            "text": "Vos équipes proposent-elles régulièrement des innovations pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92998",
                            "text": "Vos collaborateurs prennent-ils des initiatives pour améliorer l'efficacité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_11865",
                            "text": "Encouragez-vous l'innovation dans les approches et méthodes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85929",
                            "text": "Vos équipes anticipent-elles les évolutions des besoins de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_9143",
                            "text": "La créativité de vos collaborateurs enrichit-elle les contenus ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_45111",
                            "text": "Vos formateurs explorent-ils de nouvelles modalités pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_9853",
                            "text": "Proposez-vous régulièrement des innovations pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_5401",
                            "text": "Prenez-vous des initiatives pour améliorer l'efficacité des formations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_32550",
                            "text": "Innovez-vous dans vos approches et méthodes de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85128",
                            "text": "Anticipez-vous les évolutions des besoins de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4584",
                            "text": "Votre créativité contribue-t-elle à enrichir les contenus de formation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_15068",
                            "text": "Explorez-vous de nouvelles modalités pédagogiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Vision et alignement commercial",
            "rubriques": [
                {
                    "titre": "Vision et stratégie commerciale CODIR",
                    "questions": [
                        {
                            "code": "Q_47268",
                            "text": "Comprenez-vous clairement la vision commerciale de CODIR et sa place dans la stratégie du Groupe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_78859",
                            "text": "Savez-vous comment votre action commerciale contribue aux objectifs stratégiques de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_87878",
                            "text": "Maîtrisez-vous les enjeux concurrentiels et le positionnement de CODIR sur le marché ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_14057",
                            "text": "Êtes-vous capable d'expliquer la valeur ajoutée de CODIR à vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_5616",
                            "text": "Intégrez-vous la stratégie CODIR dans vos argumentaires de vente ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_14533",
                            "text": "Adaptez-vous votre discours commercial selon le type de client (indépendant/enseigne) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_48112",
                            "text": "Mesurez-vous l'impact de vos actions sur l'atteinte des objectifs stratégiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Soutien à la politique commerciale du Groupe",
                    "questions": [
                        {
                            "code": "Q_13167",
                            "text": "Soutenez-vous efficacement la politique tarifaire et les conditions commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_24754",
                            "text": "Appliquez-vous correctement les dispositifs RFA et les programmes de fidélisation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51213",
                            "text": "Respectez-vous les orientations commerciales définies par la direction ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_12330",
                            "text": "Contribuez-vous activement aux campagnes commerciales et événements CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96792",
                            "text": "Alignez-vous vos actions avec les priorités définies par le management commercial ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34537",
                            "text": "Relayez-vous efficacement les messages et orientations de la direction auprès de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_52013",
                            "text": "Participez-vous constructivement aux réunions d'équipe et de direction ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Culture commerciale et relation client",
                    "questions": [
                        {
                            "code": "Q_52184",
                            "text": "Incarnez-vous les valeurs de service et d'excellence client de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_30998",
                            "text": "Développez-vous une relation de confiance durable avec vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_47673",
                            "text": "Adaptez-vous votre approche commerciale à la culture de chaque client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_268",
                            "text": "Respectez-vous l'éthique commerciale et les bonnes pratiques CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_73033",
                            "text": "Contribuez-vous à l'image de marque positive de CODIR sur le terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_27328",
                            "text": "Faites-vous preuve d'intégrité dans toutes vos relations commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_63730",
                            "text": "Représentez-vous dignement les valeurs CODIR lors de vos interactions clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Objectifs et performance commerciale",
                    "questions": [
                        {
                            "code": "Q_25086",
                            "text": "Maîtrisez-vous vos objectifs de vente et de développement territorial ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_93624",
                            "text": "Suivez-vous régulièrement vos indicateurs de performance commerciale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_25057",
                            "text": "Atteignez-vous vos objectifs de chiffre d'affaires et de rentabilité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21428",
                            "text": "Contribuez-vous à l'atteinte des objectifs collectifs de l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84274",
                            "text": "Analysez-vous vos résultats pour améliorer votre performance ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_534",
                            "text": "Anticipez-vous les difficultés pour ajuster vos actions en conséquence ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_53279",
                            "text": "Communiquez-vous proactivement sur vos résultats et difficultés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Organisation commerciale",
            "rubriques": [
                {
                    "titre": "Expertise produits et spécialisations",
                    "questions": [
                        {
                            "code": "Q_91333",
                            "text": "Maîtrisez-vous parfaitement les verres CODIR (caractéristiques techniques et avantages) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_1387",
                            "text": "Savez-vous conseiller efficacement vos clients sur les lentilles de contact ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_48342",
                            "text": "Connaissez-vous l'offre montures et savez-vous la valoriser ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34835",
                            "text": "Êtes-vous à jour sur les innovations et nouveautés produits ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_42178",
                            "text": "Adaptez-vous votre expertise aux besoins spécifiques de chaque client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_8367",
                            "text": "Participez-vous activement aux formations produits Formatech ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_31628",
                            "text": "Savez-vous répondre aux questions techniques complexes de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_97505",
                            "text": "Utilisez-vous efficacement l'expertise de l'équipe Formatech pour vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Rôles et coordination équipe commerciale",
                    "questions": [
                        {
                            "code": "Q_64306",
                            "text": "Comprenez-vous clairement votre rôle et vos responsabilités dans l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_49201",
                            "text": "Collaborez-vous efficacement avec vos collègues commerciaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_3735",
                            "text": "Coordonnez-vous vos actions avec les Responsables Comptes-Clés quand nécessaire ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_69204",
                            "text": "Respectez-vous les périmètres et zones d'intervention de chacun ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_61202",
                            "text": "Participez-vous constructivement aux réunions et projets d'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_49189",
                            "text": "Échangez-vous régulièrement avec vos collègues sur les bonnes pratiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_69229",
                            "text": "Sollicitez-vous l'aide de vos collègues en cas de besoin ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Collaboration terrain et synergies",
                    "questions": [
                        {
                            "code": "Q_83017",
                            "text": "Collaborez-vous efficacement avec la DRRA (Direction Réseaux) ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51144",
                            "text": "Développez-vous des synergies avec les équipes marketing et support ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_50491",
                            "text": "Partagez-vous vos bonnes pratiques et retours terrain avec l'équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_86158",
                            "text": "Contribuez-vous aux projets transversaux et initiatives collectives ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_65404",
                            "text": "Sollicitez-vous le support des équipes internes quand nécessaire ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_58749",
                            "text": "Transmettez-vous efficacement les informations terrain aux équipes support ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_68037",
                            "text": "Exploitez-vous les ressources et expertises disponibles dans le groupe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Outils et méthodes de vente",
            "rubriques": [
                {
                    "titre": "Organisation territoriale et clientèle",
                    "questions": [
                        {
                            "code": "Q_15039",
                            "text": "Gérez-vous efficacement votre portefeuille client et votre territoire ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_16879",
                            "text": "Priorisez-vous vos actions commerciales selon le potentiel de chaque client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_81632",
                            "text": "Planifiez-vous vos tournées et visites de manière optimale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_13635",
                            "text": "Identifiez-vous et prospectez-vous de nouveaux clients potentiels ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_57242",
                            "text": "Segmentez-vous votre approche selon les types de clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_76359",
                            "text": "Analysez-vous régulièrement la performance de votre territoire ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_34552",
                            "text": "Adaptez-vous votre stratégie territoriale selon les évolutions du marché ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_94578",
                            "text": "Optimisez-vous vos déplacements pour maximiser votre efficacité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Maîtrise des outils commerciaux",
                    "questions": [
                        {
                            "code": "Q_83648",
                            "text": "Maîtrisez-vous parfaitement les outils CRM et de gestion commerciale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96158",
                            "text": "Utilisez-vous efficacement les systèmes de commande et de suivi CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_54583",
                            "text": "Exploitez-vous les données et analyses disponibles pour optimiser vos actions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_10744",
                            "text": "Maintenez-vous à jour vos informations clients et vos rapports d'activité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_86764",
                            "text": "Adaptez-vous rapidement aux évolutions des outils commerciaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92170",
                            "text": "Utilisez-vous les fonctionnalités avancées des outils à votre disposition ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_61524",
                            "text": "Saisissez-vous correctement et en temps réel vos activités commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_39097",
                            "text": "Exploitez-vous les alertes et notifications pour optimiser votre suivi client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Utilisation des supports de vente",
                    "questions": [
                        {
                            "code": "Q_65110",
                            "text": "Utilisez-vous efficacement les supports marketing et PLV mis à disposition ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_14826",
                            "text": "Adaptez-vous vos présentations et supports selon les besoins clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_81150",
                            "text": "Maîtrisez-vous les argumentaires et outils d'aide à la vente ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_5465",
                            "text": "Exploitez-vous les formations et contenus développés par l'équipe marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_98126",
                            "text": "Contribuez-vous aux retours terrain pour améliorer les supports de vente ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_95117",
                            "text": "Personnalisez-vous vos présentations selon le profil du client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21944",
                            "text": "Utilisez-vous efficacement les outils digitaux de présentation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51790",
                            "text": "Maintenez-vous vos supports de vente à jour et en bon état ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Processus et méthodes commerciales",
                    "questions": [
                        {
                            "code": "Q_10942",
                            "text": "Respectez-vous les processus de vente et les étapes de qualification ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_41861",
                            "text": "Appliquez-vous une méthode structurée dans vos négociations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_39384",
                            "text": "Suivez-vous rigoureusement le processus de prise de commande ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_13978",
                            "text": "Respectez-vous les procédures de validation et de transmission des informations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_74547",
                            "text": "Contribuez-vous à l'amélioration continue des processus commerciaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_47881",
                            "text": "Documentez-vous correctement vos interactions et décisions commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_11362",
                            "text": "Respectez-vous les délais et échéances dans vos processus de vente ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Développement des compétences commerciales",
                    "questions": [
                        {
                            "code": "Q_94261",
                            "text": "Participez-vous activement aux formations commerciales proposées ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4306",
                            "text": "Développez-vous continuellement vos techniques de vente et de négociation ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_40273",
                            "text": "Cherchez-vous à améliorer vos connaissances du marché et de la concurrence ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_78140",
                            "text": "Sollicitez-vous des feedbacks pour progresser dans votre pratique commerciale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_13825",
                            "text": "Partagez-vous votre expertise et accompagnez-vous vos collègues moins expérimentés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_52518",
                            "text": "Vous tenez-vous informé des évolutions du secteur optique/audition ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_35599",
                            "text": "Développez-vous vos compétences en communication et relation client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Performance et excellence terrain",
            "rubriques": [
                {
                    "titre": "Accompagnement et support client",
                    "questions": [
                        {
                            "code": "Q_84207",
                            "text": "Accompagnez-vous efficacement vos clients dans leurs décisions d'achat ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_32837",
                            "text": "Apportez-vous des conseils personnalisés selon les besoins spécifiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_43586",
                            "text": "Assurez-vous un suivi régulier et proactif de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_58038",
                            "text": "Résolvez-vous rapidement les problèmes et réclamations clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_59703",
                            "text": "Développez-vous une relation de partenariat durable avec vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_73601",
                            "text": "Anticipez-vous les besoins futurs de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_78867",
                            "text": "Proposez-vous des solutions créatives adaptées aux défis de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Excellence dans la relation commerciale",
                    "questions": [
                        {
                            "code": "Q_80428",
                            "text": "Faites-vous preuve d'excellence dans la qualité de vos échanges clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_46339",
                            "text": "Adaptez-vous votre communication selon le profil et les attentes de chaque client ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_61534",
                            "text": "Respectez-vous les engagements pris envers vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_61116",
                            "text": "Anticipez-vous les besoins de vos clients pour leur proposer des solutions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92297",
                            "text": "Incarnez-vous l'image d'expertise et de professionnalisme de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_82281",
                            "text": "Créez-vous une expérience client mémorable et différenciante ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51015",
                            "text": "Maintenez-vous un niveau d'excellence constant dans toutes vos interactions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Réactivité et gestion des urgences",
                    "questions": [
                        {
                            "code": "Q_31048",
                            "text": "Réagissez-vous rapidement aux demandes urgentes de vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_81067",
                            "text": "Gérez-vous efficacement les situations de crise ou les réclamations ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_91212",
                            "text": "Priorisez-vous vos actions selon le niveau d'urgence et d'importance ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_93710",
                            "text": "Communiquez-vous rapidement les informations critiques à votre hiérarchie ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4003",
                            "text": "Adaptez-vous votre planning pour répondre aux urgences terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_85248",
                            "text": "Gardez-vous votre sang-froid dans les situations tendues ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Qualité et cohérence des actions",
                    "questions": [
                        {
                            "code": "Q_32897",
                            "text": "Respectez-vous la qualité et la cohérence dans vos actions commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_4733",
                            "text": "Veillez-vous à la cohérence de vos messages avec la communication CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_98623",
                            "text": "Maintenez-vous un niveau de service constant avec tous vos clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_2427",
                            "text": "Respectez-vous les standards de qualité dans vos présentations et propositions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_59271",
                            "text": "Contribuez-vous à l'image de marque professionnelle de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_10659",
                            "text": "Vérifiez-vous la qualité de vos livrables avant transmission aux clients ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Innovation et développement commercial",
                    "questions": [
                        {
                            "code": "Q_91736",
                            "text": "Proposez-vous des idées innovantes pour développer votre territoire ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_63831",
                            "text": "Identifiez-vous de nouvelles opportunités commerciales et de marchés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_58390",
                            "text": "Contribuez-vous aux réflexions stratégiques sur le développement commercial ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_959",
                            "text": "Expérimentez-vous de nouvelles approches pour améliorer vos résultats ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_35890",
                            "text": "Proposez-vous des améliorations basées sur votre expérience terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Stratégie Marketing et Positionnement",
            "rubriques": [
                {
                    "titre": "Vision marketing : stratégie et positionnement CODIR",
                    "questions": [
                        {
                            "code": "Q_52054",
                            "text": "Comprenez-vous clairement la vision marketing et le positionnement de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_76115",
                            "text": "Savez-vous comment votre travail contribue au positionnement stratégique de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_54524",
                            "text": "Maîtrisez-vous les enjeux de différenciation marketing de CODIR sur le marché ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_70889",
                            "text": "Comprenez-vous les objectifs de la stratégie marketing à long terme ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92269",
                            "text": "Êtes-vous aligné sur la vision marketing portée par la direction ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Stratégie marketing : support de la politique commerciale",
                    "questions": [
                        {
                            "code": "Q_8023",
                            "text": "Comprenez-vous comment le marketing soutient la politique commerciale de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_48518",
                            "text": "Savez-vous adapter vos actions marketing aux besoins des équipes commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_62260",
                            "text": "Maîtrisez-vous l'articulation entre stratégie marketing et objectifs commerciaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_8264",
                            "text": "Comprenez-vous l'impact de vos actions sur la performance commerciale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96187",
                            "text": "Savez-vous créer des synergies entre marketing et force de vente ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Culture marketing et ADN communication CODIR",
                    "questions": [
                        {
                            "code": "Q_68750",
                            "text": "Comprenez-vous et incarnez-vous l'ADN communication de CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_87227",
                            "text": "Respectez-vous les codes et valeurs de la marque CODIR dans vos productions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_48076",
                            "text": "Maîtrisez-vous les messages clés et le ton de communication CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_24081",
                            "text": "Savez-vous transmettre la culture CODIR dans vos interactions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_46559",
                            "text": "Êtes-vous un ambassadeur de la culture marketing CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Objectifs marketing et KPI de performance",
                    "questions": [
                        {
                            "code": "Q_23020",
                            "text": "Comprenez-vous les objectifs marketing et KPI de votre équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_14604",
                            "text": "Savez-vous mesurer l'impact de vos actions marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_54950",
                            "text": "Maîtrisez-vous les indicateurs de performance de votre domaine ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_28575",
                            "text": "Contribuez-vous activement à l'atteinte des objectifs marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_92941",
                            "text": "Savez-vous analyser et optimiser vos résultats marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Communication et Brand Management",
            "rubriques": [
                {
                    "titre": "Composition et spécialisation de l'équipe marketing",
                    "questions": [
                        {
                            "code": "Q_92691",
                            "text": "Comprenez-vous votre rôle dans la composition de l'équipe marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_24047",
                            "text": "Connaissez-vous les spécialisations de vos collègues marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_87724",
                            "text": "Savez-vous collaborer efficacement selon les expertises de chacun ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_10406",
                            "text": "Comprenez-vous comment optimiser la complémentarité des profils ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84459",
                            "text": "Contribuez-vous à l'efficacité collective de l'équipe marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Processus créatifs et production de contenu",
                    "questions": [
                        {
                            "code": "Q_26596",
                            "text": "Maîtrisez-vous les expertises en communication et événementiel ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_93305",
                            "text": "Savez-vous créer des supports de communication efficaces ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_28523",
                            "text": "Comprenez-vous les enjeux de l'événementiel CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_72846",
                            "text": "Maîtrisez-vous les techniques de communication visuelle et digitale ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_57538",
                            "text": "Savez-vous adapter votre communication selon les publics cibles ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Coordination et cohérence des messages marketing",
                    "questions": [
                        {
                            "code": "Q_70482",
                            "text": "Collaborez-vous efficacement avec les équipes commerciales terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_42860",
                            "text": "Comprenez-vous les besoins spécifiques des attachés commerciaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_95455",
                            "text": "Savez-vous adapter vos supports aux réalités terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_21791",
                            "text": "Maintenez-vous un dialogue constructif avec les équipes commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_91641",
                            "text": "Anticipez-vous les besoins des responsables comptes clés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Gestion de la marque et image de CODIR",
                    "questions": [
                        {
                            "code": "Q_45031",
                            "text": "Savez-vous organiser et coordonner efficacement vos projets marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_96445",
                            "text": "Maîtrisez-vous la planification et le suivi de vos missions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_20838",
                            "text": "Respectez-vous les délais et engagements pris sur vos projets ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_1597",
                            "text": "Savez-vous prioriser vos tâches selon les enjeux marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_19766",
                            "text": "Communiquez-vous efficacement sur l'avancement de vos projets ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Performance et Mesure",
            "rubriques": [
                {
                    "titre": "Processus marketing optimisés et automatisation",
                    "questions": [
                        {
                            "code": "Q_15260",
                            "text": "Maîtrisez-vous les outils de communication et supports marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_66314",
                            "text": "Savez-vous créer des plaquettes et supports de qualité professionnelle ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_551",
                            "text": "Maîtrisez-vous la création de PLV et supports terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_33378",
                            "text": "Savez-vous adapter vos supports selon les besoins spécifiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_55469",
                            "text": "Respectez-vous les chartes graphiques et standards CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Outils de mesure et analytique marketing",
                    "questions": [
                        {
                            "code": "Q_95077",
                            "text": "Maîtrisez-vous Konnect et les plateformes digitales CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_37328",
                            "text": "Savez-vous utiliser efficacement les outils d'emailing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_89569",
                            "text": "Comprenez-vous les enjeux de la communication digitale interne ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_69263",
                            "text": "Maîtrisez-vous la gestion des contenus sur les plateformes digitales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_68461",
                            "text": "Savez-vous optimiser l'usage des outils digitaux pour votre équipe ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Excellence relationnelle et support aux équipes terrain",
                    "questions": [
                        {
                            "code": "Q_19615",
                            "text": "Respectez-vous les processus de création et validation des contenus ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_42368",
                            "text": "Savez-vous suivre les étapes de validation des supports marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_31393",
                            "text": "Maîtrisez-vous les circuits d'approbation des communications ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_58569",
                            "text": "Respectez-vous les standards de qualité dans vos productions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_25408",
                            "text": "Contribuez-vous à l'amélioration des processus de création ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "ROI marketing et efficacité budgétaire",
                    "questions": [
                        {
                            "code": "Q_86277",
                            "text": "Développez-vous activement vos compétences marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_78338",
                            "text": "Restez-vous informé des évolutions du marketing et de la communication ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_91920",
                            "text": "Participez-vous aux formations proposées par l'entreprise ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_30081",
                            "text": "Partagez-vous vos connaissances avec vos collègues ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_30134",
                            "text": "Cherchez-vous à innover dans vos pratiques marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "titre": "Innovation et Développement",
            "rubriques": [
                {
                    "titre": "Veille concurrentielle et intelligence marketing",
                    "questions": [
                        {
                            "code": "Q_76196",
                            "text": "Fournissez-vous un support de qualité aux équipes terrain ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_79721",
                            "text": "Répondez-vous efficacement aux demandes des associés ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_98127",
                            "text": "Accompagnez-vous les équipes dans leurs besoins marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_25118",
                            "text": "Anticipez-vous les besoins de support des équipes commerciales ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_51447",
                            "text": "Mesurez-vous la satisfaction des équipes que vous accompagnez ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Innovation produits et services marketing",
                    "questions": [
                        {
                            "code": "Q_20128",
                            "text": "Excellez-vous dans la communication et l'organisation d'événements ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_45951",
                            "text": "Savez-vous organiser des AG, conventions et réunions de qualité ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_31314",
                            "text": "Maîtrisez-vous la logistique événementielle et la communication associée ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_52812",
                            "text": "Créez-vous des expériences événementielles mémorables ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_97650",
                            "text": "Mesurez-vous l'impact et le succès de vos événements ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Digitalisation et transformation marketing",
                    "questions": [
                        {
                            "code": "Q_70432",
                            "text": "Faites-vous preuve de réactivité face aux demandes urgentes ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_57508",
                            "text": "Savez-vous gérer les priorités et les urgences marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_29157",
                            "text": "Adaptez-vous rapidement vos actions selon les besoins ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_23066",
                            "text": "Maintenez-vous la qualité malgré les contraintes de délai ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_61098",
                            "text": "Communiquez-vous efficacement sur les urgences et leurs solutions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Partenariats et développement d'écosystème",
                    "questions": [
                        {
                            "code": "Q_50094",
                            "text": "Assurez-vous la qualité et cohérence de tous vos messages ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_40720",
                            "text": "Vos supports respectent-ils systématiquement l'identité CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_31999",
                            "text": "Maintenez-vous un niveau d'exigence élevé dans vos productions ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_97370",
                            "text": "Vérifiez-vous la cohérence de vos messages sur tous les canaux ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_84064",
                            "text": "Contribuez-vous à renforcer l'image de marque CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                },
                {
                    "titre": "Conformité et gouvernance marketing",
                    "questions": [
                        {
                            "code": "Q_59650",
                            "text": "Proposez-vous régulièrement des innovations marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_86426",
                            "text": "Cherchez-vous à améliorer continuellement vos pratiques ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_17449",
                            "text": "Testez-vous de nouvelles approches et outils marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_16600",
                            "text": "Partagez-vous vos innovations avec l'équipe marketing ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        },
                        {
                            "code": "Q_2298",
                            "text": "Contribuez-vous à faire évoluer les pratiques marketing CODIR ?",
                            "type": "select",
                            "options": [
                                "Totalement",
                                "Modérément",
                                "Peu",
                                "Pas du tout"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

const TakeDiagnostic: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // State pour stocker les réponses (number | string | string[])
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [error, setError] = useState<string | null>(null);
    const [isLimitReached, setIsLimitReached] = useState(false);

    React.useEffect(() => {
        const checkLimit = async () => {
            if (profile?.id) {
                const { count, error } = await supabase
                    .from('diagnostics')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id);

                if (!error && count !== null && count >= 3) {
                    setIsLimitReached(true);
                }
            }
        };
        checkLimit();
    }, [profile]);


    // Liste à plat pour validation
    const flattenedQuestions = useMemo(() => {
        const list: { section: string, rubrique: string, question: string, id: string, type: string }[] = [];
        DETAILED_QUESTIONNAIRE.sections.forEach(s => {
            s.rubriques.forEach(r => {
                r.questions.forEach(q => {
                    list.push({
                        id: q.code, // Use code as ID for stability
                        section: s.titre,
                        rubrique: r.titre,
                        question: q.text,
                        type: q.type
                    });
                });
            });
        });
        return list;
    }, []);

    const handleAnswerChange = (qCode: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qCode]: value }));
    };

    const handleMultiSelectToggle = (qCode: string, option: string) => {
        setAnswers(prev => {
            const current = (prev[qCode] as string[]) || [];
            if (current.includes(option)) {
                return { ...prev, [qCode]: current.filter(o => o !== option) };
            } else {
                return { ...prev, [qCode]: [...current, option] };
            }
        });
    };

    const calculateAverageScore = () => {
        // Only count numeric scale answers
        const values = Object.values(answers).filter(v => typeof v === 'number');
        if (values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + (b as number), 0);
        // Scale is 0-5. To normalize to 10: (avg / 5) * 10 = avg * 2
        return Number(((sum / values.length) * 2).toFixed(1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        setError(null);

        // Validation
        const missing = flattenedQuestions.filter(q => {
            const val = answers[q.id];
            if (q.type === 'multiselect') return !val || val.length === 0;
            return val === undefined || val === '';
        });

        if (missing.length > 0) {
            setError(`Veuillez répondre à toutes les questions (${missing.length} manquantes).`);
            setLoading(false);
            // Scroll to top error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            // 1. Prepare payload
            const payloadAnswers: Answer[] = flattenedQuestions.map(q => ({
                section: q.section,
                rubrique: q.rubrique,
                question: q.question,
                score: answers[q.id]
            }));

            // 2. n8n payload
            const payload = buildN8NPayload(`${profile.prenom} ${profile.nom}`, profile.email, payloadAnswers);

            // 3. Send to n8n
            const n8nResult = await sendToN8N(payload, profile); // Capture response

            // 4. Save to Supabase (only numeric score stored for Dashboard avg)
            const { data, error: dbError } = await supabase
                .from('diagnostics')
                .insert([{
                    user_id: profile.id,
                    company_id: profile.entreprise_id,
                    questionnaire_title: DETAILED_QUESTIONNAIRE.name,
                    score: Math.round(calculateAverageScore()), // Database expects integer
                    status: 'Terminé',
                    trend: 'stable',
                    team_name: 'Personnel',
                    report_data: n8nResult // Store the full JSON report
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // 5. Redirect to processing with data AND the saved ID
            navigate('/diagnostic/processing', {
                state: {
                    result: n8nResult,
                    answers: answers,
                    diagnosticId: data?.id
                }
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erreur d'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    if (isLimitReached) {
        return (
            <div className="max-w-3xl mx-auto pt-10 text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto">
                    <AlertTriangle size={40} />
                </div>
                <h1 className="text-2xl font-black text-brand-midnight">Limite atteinte</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Vous avez atteint la limite de 3 diagnostics gratuits. Pour aller plus loin et obtenir une analyse approfondie, contactez votre manager ou notre équipe support.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                        Retour au tableau de bord
                    </button>
                    <button onClick={() => navigate('/diagnostics')} className="px-6 py-3 bg-brand-turquoise text-white rounded-xl font-bold text-sm hover:bg-brand-turquoise-dark transition-colors shadow-lg shadow-brand-turquoise/20">
                        Mes Résultats
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-slate-400 hover:text-brand-midnight transition-colors">
                <ArrowLeft size={20} />
                <span className="font-bold text-sm">Retour au tableau de bord</span>
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center text-brand-turquoise">
                            <Send size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-brand-midnight tracking-tight">Diagnostic Commercial</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pulse Express</p>
                        </div>
                    </div>
                </div>

                {/* Video Intro */}
                <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl aspect-video bg-black">
                    <iframe
                        src="https://player.vimeo.com/video/1127102476?h=0f295b3996&title=0&byline=0&portrait=0"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Vimeo Video"
                    ></iframe>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10">
                    {DETAILED_QUESTIONNAIRE.sections.map((section, si) => (
                        <div key={si} className="space-y-6">
                            <div className="flex items-center space-x-3 text-brand-midnight">
                                <span className="text-base font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-brand-turquoise">{section.titre}</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div className="space-y-6">
                                {section.rubriques.flatMap((rubric) => rubric.questions).map((q, qi) => (
                                    <div key={qi} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group">
                                        <p className="text-base font-bold text-brand-midnight">{q.text}</p>

                                        {q.type === 'scale' && (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex space-x-2 flex-wrap">
                                                    {[0, 1, 2, 3, 4, 5].map((val) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => handleAnswerChange(q.code, val)}
                                                            className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${answers[q.code] === val
                                                                ? 'bg-brand-turquoise text-white shadow-lg scale-110'
                                                                : 'bg-white text-slate-400 hover:text-brand-midnight border border-slate-100'
                                                                }`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="hidden sm:flex text-[9px] font-black text-slate-300 uppercase tracking-widest gap-2">
                                                    <span>0=Pas du tout</span>
                                                    <span>5=Totalement</span>
                                                </div>
                                            </div>
                                        )}

                                        {q.type === 'select' && (
                                            <div className="relative">
                                                <select
                                                    value={answers[q.code] || ''}
                                                    onChange={(e) => handleAnswerChange(q.code, e.target.value)}
                                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl appearance-none font-bold text-brand-midnight focus:ring-4 focus:ring-brand-turquoise/10 outline-none"
                                                >
                                                    <option value="" disabled>Sélectionnez une réponse...</option>
                                                    {q.options?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                            </div>
                                        )}

                                        {q.type === 'multiselect' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options?.map(opt => {
                                                    const selected = (answers[q.code] as string[] || []).includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => handleMultiSelectToggle(q.code, opt)}
                                                            className={`px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${selected
                                                                ? 'bg-brand-turquoise text-white shadow-md'
                                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-turquoise'
                                                                }`}
                                                        >
                                                            <span>{opt}</span>
                                                            {selected && <CheckCircle2 size={14} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-fade-in">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-brand-turquoise text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-turquoise/20 hover:bg-brand-turquoise-dark transition-all flex items-center justify-center space-x-3 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Traitement en cours...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    <span>Valider mon diagnostic</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TakeDiagnostic;
