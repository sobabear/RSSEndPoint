import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class CategoryRss {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  feedUrl: string;

  @Column()
  domain: string;

  @ManyToOne(() => Category, category => category.rssFeeds)
  category: Category;
} 