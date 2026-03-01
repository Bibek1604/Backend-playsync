import { Request, Response } from 'express';
import { gameSearchService } from './game-search.service';
import { gameAnalyticsRepo } from './game-analytics.repository';

export class GameDiscoveryController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const {
        sportType, status, tags, hasSpace, hostedBy,
        sortField, sortDir, page, limit,
      } = req.query;

      const result = await gameSearchService.search({
        query: {
          sportType: sportType as string,
          status: status as any,
          tags: tags ? (tags as string).split(',') : undefined,
          hasSpace: hasSpace === 'true',
          hostedBy: hostedBy as string,
        },
        sort: sortField ? { field: sortField as any, direction: (sortDir ?? 'desc') as any } : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async suggestions(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) ?? '';
      if (!q) {
        res.status(400).json({ success: false, message: 'q query param required.' });
        return;
      }
      const items = await gameSearchService.getSuggestions(q);
      res.status(200).json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async analytics(req: Request, res: Response): Promise<void> {
    try {
      const data = await gameAnalyticsRepo.getOverview();
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
