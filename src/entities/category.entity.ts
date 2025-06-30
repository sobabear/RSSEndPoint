import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CategoryRss } from './category-rss.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => CategoryRss, categoryRss => categoryRss.category)
  rssFeeds: CategoryRss[];
} 