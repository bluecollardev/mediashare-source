import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { TextField, MultiSelectIcon } from 'mediashare/components/form';
import { DisplayPreviewOrVideo } from './DisplayPreviewOrVideo';
import { MediaCardTitle } from './MediaCardTitle';
import { MediaCardTags } from './MediaCardTags';
import { MediaCardSocial } from './MediaCardSocial';
import { mappedKeysToTags } from 'mediashare/core/utils/tags';
import { titleValidator, descriptionValidator } from 'mediashare/core/utils/validators';
import { theme, components } from 'mediashare/styles';

import { AuthorProfileDto } from 'mediashare/rxjs-api';

export interface MediaCardProps {
  id?: string;
  title?: string;
  authorProfile?: AuthorProfileDto;
  description?: string;
  sortIndex?: string;
  showSocial?: any | boolean;
  showActions?: boolean;
  showDescription?: boolean;
  showAvatar?: boolean;
  showThumbnail?: boolean;
  thumbnail?: string;
  thumbnailStyle?: any;
  mediaSrc?: string | null;
  visibility?: string;
  // TODO: Fix Tag type
  // availableTags?: Tag[];
  availableTags?: any[];
  tags?: any[];
  children?: any;
  topDrawer?: React.FC<any>;
  isEdit?: boolean;
  isPlayable?: boolean;
  isReadOnly?: boolean;
  onActionsClicked?: () => void;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onSortIndexChange?: (value: string) => void;
  onTagChange?: (value: string) => void;
  tagOptions?: any[];
  onVisibilityChange?: (value: string) => void;
  visibilityOptions?: any[];
  likes?: number;
  views?: number;
  shares?: number;
  elevation?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  title = '',
  authorProfile = {} as AuthorProfileDto,
  description = '',
  sortIndex = undefined as string,
  mediaSrc,
  showSocial = false,
  showActions = false,
  showDescription = true,
  showAvatar = true,
  showThumbnail = true,
  thumbnail = null,
  thumbnailStyle,
  onActionsClicked = () => {},
  children,
  topDrawer = undefined,
  visibility = 'private',
  // TODO: Fix Tag type
  // availableTags = [] as Tag[],
  availableTags = [] as any[],
  tags = [],
  isEdit = false,
  isPlayable = false,
  isReadOnly = false,
  elevation = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTitleChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDescriptionChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSortIndexChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onVisibilityChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTagChange = (value: string) => {},
  tagOptions = [],
  likes = 0,
  views = 0,
  shares = 0,
}: MediaCardProps) => {
  // TODO: Finish default to private!
  const [selectedVisibility, setSelectedVisibility] = useState([visibility || 'private']);
  const onSelectedVisibilityChange = (visibility) => {
    setSelectedVisibility(visibility);
    onVisibilityChange(visibility);
  };

  const mappedSelectedTags = useMemo(() => mappedKeysToTags(tags, availableTags), []);
  const mappedSelectedTagKeys = useMemo(() => {
    return mappedSelectedTags.map(({ key }) => key);
  }, []);
  const [selectedTagKeys, setSelectedTagKeys] = useState(mappedSelectedTagKeys);
  const onSelectedTagsChange = (newTags) => {
    setSelectedTagKeys(newTags);
    onTagChange(newTags);
  };

  const TopDrawer = topDrawer;

  const showMediaPreview = showThumbnail && (!!thumbnail || !!mediaSrc);
  
  // TODO: Use consts or something instead of strings!
  const visibilityOptions = [
    { key: 'private', value: `Private` },
    { key: 'shared', value: `Visible to Contacts` },
    { key: 'subscription', value: `Visible to Subscribers` },
    { key: 'public', value: `Visible to Public` },
  ];
  
  return isEdit ? (
    <View>
      {showMediaPreview ? (
        <DisplayPreviewOrVideo
          key={mediaSrc}
          mediaSrc={mediaSrc}
          isPlayable={isPlayable}
          showThumbnail={showThumbnail}
          thumbnail={thumbnail}
          style={thumbnailStyle}
        />
      ) : null}
      {topDrawer ? <TopDrawer /> : null}
      <View style={defaultStyles.container}>
        <Card elevation={elevation as any} style={{ marginTop: 25, marginBottom: 15 }}>
          <TextField
            label="Title"
            value={title}
            multiline={true}
            error={title && titleValidator(title)}
            onChangeText={(text) => onTitleChange(text)}
            disabled={isReadOnly}
          />
        </Card>
        {sortIndex !== undefined ? (
          <Card elevation={elevation as any} style={{ marginBottom: 15 }}>
            <TextField
              keyboardType="numeric"
              style={{ backgroundColor: theme.colors.surface, fontSize: 15 }}
              multiline={true}
              label="Sort Index"
              value={sortIndex}
              numberOfLines={1}
              onChangeText={(textValue) => onSortIndexChange(textValue.replace(/[^0-9]/g, ''))}
              disabled={isReadOnly}
            />
          </Card>
        ) : null}
        <Card elevation={elevation as any} style={{ marginBottom: 15 }}>
          <SectionedMultiSelect
            colors={components.multiSelect.colors}
            styles={components.multiSelect.styles}
            items={availableTags}
            IconRenderer={MultiSelectIcon as any}
            uniqueKey="key"
            displayKey="value"
            subKey="children"
            searchPlaceholderText="Enter Text"
            selectText="Select Tags"
            confirmText="Done"
            onSelectedItemsChange={onSelectedTagsChange}
            selectedItems={selectedTagKeys}
            expandDropDowns={false}
            readOnlyHeadings={false}
            showDropDowns={true}
            parentChipsRemoveChildren={true}
            showCancelButton={true}
            modalWithTouchable={false}
            modalWithSafeAreaView={true}
          />
          <SectionedMultiSelect
            colors={components.multiSelect.colors}
            styles={components.multiSelect.styles}
            items={visibilityOptions}
            IconRenderer={MultiSelectIcon as any}
            uniqueKey="key"
            displayKey="value"
            subKey="children"
            searchPlaceholderText="Enter Text"
            selectText="Share With"
            confirmText="Done"
            onSelectedItemsChange={onSelectedVisibilityChange}
            selectedItems={selectedVisibility}
            single={true}
            hideSearch={true}
            expandDropDowns={false}
            readOnlyHeadings={false}
            showDropDowns={false}
            showChips={false}
            parentChipsRemoveChildren={false}
            showCancelButton={true}
            modalWithTouchable={false}
            modalWithSafeAreaView={true}
          />
          
        </Card>
        <View>{children}</View>
        {/* Description can be the longest field so we've moved it to last when we're in edit mode */}
        <Card elevation={elevation as any} style={{ marginTop: 25, marginBottom: 25 }}>
          <TextField
            style={{ height: 500, overflow: 'scroll', backgroundColor: theme.colors.surface, fontSize: 15 }}
            multiline={true}
            label="Description"
            value={description}
            numberOfLines={10}
            error={title && descriptionValidator(description)}
            onChangeText={(text) => onDescriptionChange(text)}
            disabled={isReadOnly}
          />
        </Card>
      </View>
    </View>
  ) : (
    <Card style={defaultStyles.card} elevation={elevation as any}>
      {showMediaPreview ? (
        <DisplayPreviewOrVideo
          key={mediaSrc}
          mediaSrc={mediaSrc}
          isPlayable={isPlayable}
          showThumbnail={showThumbnail}
          thumbnail={thumbnail}
          style={thumbnailStyle}
        />
      ) : null}
      {/* Had to use actual text spaces to space this out for some reason not going to look into it now... */}
      <MediaCardTitle
        title={title}
        authorProfile={authorProfile}
        visibility={visibility}
        showThumbnail={showAvatar}
        showActions={showActions}
        showSocial={showSocial}
        likes={likes}
        shares={shares}
        views={views}
        onActionsClicked={onActionsClicked}
        style={!showMediaPreview ? { marginTop: 0 } : {}}
      />
      <Card.Content style={{ marginBottom: 15 }}>
        <MediaCardTags tags={mappedSelectedTags} />
      </Card.Content>
      <Card.Content style={{ marginTop: 0, marginBottom: 30 }}>
        {children}
        {showDescription ? <Paragraph style={showSocial ? defaultStyles.descriptionWithSocial : defaultStyles.description}>{description}</Paragraph> : null}
      </Card.Content>
    </Card>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  card: {
    paddingTop: 5,
    margin: 0,
  },
  description: {
    marginBottom: 15,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
  },
  descriptionWithSocial: {
    marginTop: 15,
    marginBottom: 30,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
  },
});
