import { apiClient } from '@/api/axios'
import type { Match, Section, PaginatedResponse } from '@/types'

export interface LeagueCard {
    imageSrc: string;
    imageAlt: string;
    title: string;
    subtitle?: string;
    size: "large" | "medium" | "small";
}

export const matchApi = {
    // Server có thể trả về PaginatedResponse<Match> hoặc Match[] thẳng
    // useMatches hook sẽ normalize về Match[]
    getAll: () =>
        apiClient.get<PaginatedResponse<Match> | Match[]>('/api/v1/matches'),

    getById: (matchId: string) =>
        apiClient.get<Match>(`/api/v1/matches/${matchId}`),

    getSections: (matchId: string) =>
        apiClient.get<Section[]>(`/api/v1/matches/${matchId}/sections`),
}

// ─── Mock League cards (UI only) ─────────────────────────────────────────────
export const LEAGUES: LeagueCard[] = [
    {
        imageSrc:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBEu-kFM8DqNre9pkTcIxfqLdjIJnsoWVLCROMqnH_ZzZbJ7qTgdac2TyY-DBwA_GQwlixIenRFxx6s-B5MBxpn7DYSDJvd6ccb9koMt8CNZMQpbr_AqGFYtLiMXpCcjaqvTsLYKIa0b9dDK-EuFoFQw7Y7_HuP4vc8EN1cittfJSuaI_lQ_VkrH_J7u-SJxv4O1rj2yRBTMCe00fB6O6BwMc4BK1O3RQrcZfTcRrbcDBR_9ebCizE0HRhBE8sK_t_mDYIHwHScKg",
        imageAlt: "UEFA Champions League match atmosphere",
        title: "Champions\nLeague",
        size: "large",
    },
    {
        imageSrc:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCIGo4M6HQ0109A02H9XWeISKp75U7YscyggRoE-EePzdHeOFCLFlF-_HxZ89z26IYrK0HjBfXbsZxhuLsecje_hLmJ02wHqWeSKCP03XgqUkyKFZ6n2NpQqdgG0vrUxMi-_LvMqTp0lhreuRShZAcRFAX5f_A64V9j9ew1WTaKdpkTiKAQ8sYCr_gbon8Y6Z6BVpqQatMB5w3oynS3c7vo9wT1BNl5A00Te8oagpMzIgpqdykxVRX6rbduhD65uTNBCtnE_kszHg",
        imageAlt: "English Premier League stadium",
        title: "Premier League",
        subtitle: "20+ Trận đấu sắp tới",
        size: "medium",
    },
    {
        imageSrc:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDwZ0tMdUXh9gQNFO2aTTjSHno4CmUs3VGXwYV54EfhCAJgSbiC7hyHVEDWsgRUxQp17dot9tWN83uZAZGgg1p5Ac1lPHEkSFN6kq7obCQPlVihiRyOJbrXkKPvl2dexTm6tJcRbRkSSP6ySRU0UfCpmc1jyFw9rtDvPAuUYpzkORByFUES6PMJPwgXsc-Ev7wXhxhJvF-hKuE05YtBcUqF4q3wuW3PbwKQ2T-FjyK7brxZWg5hC5vYeXsBKm0T-ClJnjXawT_V5w",
        imageAlt: "V-League match action",
        title: "V-League",
        size: "small",
    },
    {
        imageSrc:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBEWawXqNZRawLdJI9IlNNGNePVoAezkEkdLt4IxdhE98LKhymcd9OPovZY9joQMTS0VL1xXaL5seR46ZNKsSuDJ7V1eu3rcgY9fPOF5mD-f6KQUMgOamRhOwjWkzAxmVYS9HgU1lKQ6aaWy4VWyPpQ1F1T9zCAX-R1ib6LgMBm48aKpGIuobMBBIrbhsdhTL59S5knYVqfPrJGcNmLxyVJuCoKbTZYPydiRdZAmz1HTW8_jPxkrr1lOvcoxfnvTIVl6DpYbXMWOw",
        imageAlt: "La Liga stadium",
        title: "La Liga",
        size: "small",
    },
];